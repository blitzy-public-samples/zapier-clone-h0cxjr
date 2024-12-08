/**
 * Human Tasks:
 * 1. Ensure RabbitMQ server is properly installed and configured
 * 2. Set up appropriate queue credentials in environment variables
 * 3. Configure queue monitoring and alerting thresholds
 * 4. Verify SSL/TLS settings for queue connections in production
 * 5. Set up dead letter queues for failed message handling
 */

// amqplib v0.10.3
import * as amqp from 'amqplib';
import { logError, logInfo } from '../utils/logger.util';
import { encryptData, decryptData } from '../utils/encryption.util';
import { ERROR_CODES } from '../constants/error.constants';

// Global retry configuration
const QUEUE_RETRY_DELAY = 5000; // 5 seconds delay between retries
const QUEUE_MAX_RETRIES = 3; // Maximum number of connection retry attempts
const QUEUE_CONNECTION_URL = process.env.QUEUE_CONNECTION_URL;

// Connection instance
let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * Initializes the message queue connection using the provided configuration settings.
 * Addresses requirement: Async Communication Configuration from Technical Specification/System Design/Data Storage Components
 * 
 * @returns Promise<amqp.Connection> A connection object to the message queue system
 * @throws Error if connection fails after max retries
 */
export const initializeQueue = async (): Promise<amqp.Connection> => {
  let retryCount = 0;

  while (retryCount < QUEUE_MAX_RETRIES) {
    try {
      if (!QUEUE_CONNECTION_URL) {
        throw new Error('Queue connection URL not configured');
      }

      // Decrypt the connection URL if it's encrypted
      const decryptedUrl = await decryptData(QUEUE_CONNECTION_URL, process.env.ENCRYPTION_KEY || '');

      // Establish connection
      connection = await amqp.connect(decryptedUrl);
      channel = await connection.createChannel();

      // Set up connection error handlers
      connection.on('error', (error) => {
        logError(ERROR_CODES.InternalServerError, `Queue connection error: ${error.message}`);
        connection = null;
        channel = null;
      });

      connection.on('close', () => {
        logInfo('Queue connection closed');
        connection = null;
        channel = null;
      });

      logInfo('Successfully connected to message queue');
      return connection;

    } catch (error) {
      retryCount++;
      logError(
        ERROR_CODES.InternalServerError,
        `Failed to connect to message queue (attempt ${retryCount}/${QUEUE_MAX_RETRIES}): ${(error as Error).message}`
      );

      if (retryCount === QUEUE_MAX_RETRIES) {
        throw new Error(`Failed to connect to message queue after ${QUEUE_MAX_RETRIES} attempts`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, QUEUE_RETRY_DELAY));
    }
  }

  throw new Error('Failed to initialize queue connection');
};

/**
 * Publishes a message to the specified queue.
 * Addresses requirement: Async Communication Configuration from Technical Specification/System Design/Data Storage Components
 * 
 * @param queueName - Name of the queue to publish to
 * @param message - Message content to be published
 * @returns Promise<boolean> True if the message was successfully published
 */
export const publishMessage = async (
  queueName: string,
  message: any
): Promise<boolean> => {
  try {
    if (!channel) {
      if (!connection) {
        await initializeQueue();
      }
      channel = await connection!.createChannel();
    }

    // Assert queue exists
    await channel.assertQueue(queueName, {
      durable: true, // Queue survives broker restart
      deadLetterExchange: 'dlx', // Dead letter exchange for failed messages
      maxPriority: 10 // Enable message prioritization
    });

    // Convert message to buffer if needed
    const messageBuffer = Buffer.from(
      typeof message === 'string' ? message : JSON.stringify(message)
    );

    // Publish message with persistent delivery
    const result = channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
      contentType: 'application/json'
    });

    logInfo(`Message published to queue: ${queueName}`, { messageSize: messageBuffer.length });
    return result;

  } catch (error) {
    logError(
      ERROR_CODES.InternalServerError,
      `Failed to publish message to queue ${queueName}: ${(error as Error).message}`
    );
    return false;
  }
};

/**
 * Consumes messages from the specified queue and processes them using a callback function.
 * Addresses requirement: Async Communication Configuration from Technical Specification/System Design/Data Storage Components
 * 
 * @param queueName - Name of the queue to consume from
 * @param callback - Function to process received messages
 * @returns Promise<boolean> True if the consumer was successfully set up
 */
export const consumeMessages = async (
  queueName: string,
  callback: (message: amqp.ConsumeMessage | null) => void
): Promise<boolean> => {
  try {
    if (!channel) {
      if (!connection) {
        await initializeQueue();
      }
      channel = await connection!.createChannel();
    }

    // Assert queue exists
    await channel.assertQueue(queueName, {
      durable: true,
      deadLetterExchange: 'dlx',
      maxPriority: 10
    });

    // Set prefetch count to control concurrent message processing
    await channel.prefetch(1);

    // Start consuming messages
    await channel.consume(queueName, async (message) => {
      try {
        if (message) {
          await callback(message);
          channel?.ack(message); // Acknowledge successful processing
        }
      } catch (error) {
        logError(
          ERROR_CODES.InternalServerError,
          `Error processing message from queue ${queueName}: ${(error as Error).message}`
        );
        
        // Reject the message and requeue if not exceeded max retries
        const retryCount = parseInt(message?.properties.headers?.['x-retry-count'] || '0');
        if (retryCount < QUEUE_MAX_RETRIES) {
          channel?.reject(message!, true);
        } else {
          channel?.reject(message!, false); // Send to dead letter queue
        }
      }
    });

    logInfo(`Consumer set up successfully for queue: ${queueName}`);
    return true;

  } catch (error) {
    logError(
      ERROR_CODES.InternalServerError,
      `Failed to set up consumer for queue ${queueName}: ${(error as Error).message}`
    );
    return false;
  }
};