/**
 * Human Tasks:
 * 1. Ensure RabbitMQ server is properly installed and configured
 * 2. Verify queue credentials and connection settings in environment variables
 * 3. Set up appropriate queue monitoring and alerting thresholds
 * 4. Configure dead letter queues for failed message handling
 * 5. Review and adjust queue performance parameters based on load testing
 */

// amqplib v0.10.3
import * as amqp from 'amqplib';
import { initializeQueue } from '../config/queue.config';
import { logError, logInfo } from '../utils/logger.util';
import { handleError } from '../utils/error.util';
import { ExecutionStatus } from '../types/execution.types';

/**
 * Publishes a message to a specified queue.
 * Addresses requirement: Execution Features - Implements asynchronous processing
 * 
 * @param queueName - Name of the queue to publish to
 * @param message - Message content to be published
 * @returns Promise<boolean> True if the message was successfully published
 */
export const publishToQueue = async (
  queueName: string,
  message: any
): Promise<boolean> => {
  try {
    // Validate input parameters
    if (!queueName || typeof queueName !== 'string') {
      throw new Error('Invalid queue name provided');
    }

    // Initialize queue connection
    const connection = await initializeQueue();
    const channel = await connection.createChannel();

    // Assert queue exists with proper configuration
    await channel.assertQueue(queueName, {
      durable: true, // Queue survives broker restart
      deadLetterExchange: 'dlx', // Configure dead letter exchange
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
      contentType: 'application/json',
      headers: {
        'x-retry-count': 0
      }
    });

    // Log successful publish
    logInfo(`Message published to queue: ${queueName}`, {
      queueName,
      messageSize: messageBuffer.length,
      timestamp: new Date().toISOString()
    });

    // Close channel after publishing
    await channel.close();
    return result;

  } catch (error) {
    logError(`Failed to publish message to queue ${queueName}: ${(error as Error).message}`);
    handleError(error as Error);
    return false;
  }
};

/**
 * Consumes messages from a specified queue and processes them using a callback function.
 * Addresses requirement: Execution Features - Implements asynchronous processing
 * 
 * @param queueName - Name of the queue to consume from
 * @param callback - Function to process received messages
 * @returns Promise<boolean> True if the consumer was successfully set up
 */
export const consumeFromQueue = async (
  queueName: string,
  callback: (message: amqp.ConsumeMessage | null) => void
): Promise<boolean> => {
  try {
    // Validate input parameters
    if (!queueName || typeof queueName !== 'string') {
      throw new Error('Invalid queue name provided');
    }
    if (typeof callback !== 'function') {
      throw new Error('Invalid callback function provided');
    }

    // Initialize queue connection
    const connection = await initializeQueue();
    const channel = await connection.createChannel();

    // Assert queue exists with proper configuration
    await channel.assertQueue(queueName, {
      durable: true,
      deadLetterExchange: 'dlx',
      maxPriority: 10
    });

    // Set prefetch count to control concurrent processing
    await channel.prefetch(1);

    // Set up consumer with message handling
    await channel.consume(queueName, async (message) => {
      try {
        if (message) {
          // Process message using provided callback
          await callback(message);
          
          // Acknowledge successful processing
          channel.ack(message);
          
          logInfo(`Message processed successfully from queue: ${queueName}`, {
            queueName,
            messageId: message.properties.messageId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logError(`Error processing message from queue ${queueName}: ${(error as Error).message}`);
        
        // Handle message retry logic
        const retryCount = parseInt(message?.properties.headers?.['x-retry-count'] || '0');
        if (retryCount < 3) {
          // Reject and requeue with incremented retry count
          channel.reject(message!, false);
          await publishToQueue(queueName, {
            ...JSON.parse(message!.content.toString()),
            headers: {
              'x-retry-count': retryCount + 1
            }
          });
        } else {
          // Send to dead letter queue after max retries
          channel.reject(message!, false);
        }
      }
    });

    logInfo(`Consumer set up successfully for queue: ${queueName}`);
    return true;

  } catch (error) {
    logError(`Failed to set up consumer for queue ${queueName}: ${(error as Error).message}`);
    handleError(error as Error);
    return false;
  }
};

/**
 * Monitors the status of a specified queue and logs its metrics.
 * Addresses requirement: Execution Features - Implements real-time monitoring
 * 
 * @param queueName - Name of the queue to monitor
 */
export const monitorQueueStatus = async (queueName: string): Promise<void> => {
  try {
    // Validate input parameter
    if (!queueName || typeof queueName !== 'string') {
      throw new Error('Invalid queue name provided');
    }

    // Initialize queue connection
    const connection = await initializeQueue();
    const channel = await connection.createChannel();

    // Check queue status and get metrics
    const queueInfo = await channel.checkQueue(queueName);

    // Log queue metrics
    logInfo(`Queue status for ${queueName}`, {
      queueName,
      messageCount: queueInfo.messageCount,
      consumerCount: queueInfo.consumerCount,
      status: queueInfo.messageCount > 0 ? ExecutionStatus.RUNNING : ExecutionStatus.COMPLETED,
      timestamp: new Date().toISOString()
    });

    // Close channel after monitoring
    await channel.close();

  } catch (error) {
    logError(`Failed to monitor queue ${queueName}: ${(error as Error).message}`);
    handleError(error as Error);
  }
};