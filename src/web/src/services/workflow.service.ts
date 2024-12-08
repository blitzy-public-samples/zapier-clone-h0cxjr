/**
 * @fileoverview Service functions for managing workflows, including CRUD operations and API interactions.
 * Requirements addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements service functions to manage workflows, ensuring seamless interaction with the backend API.
 */

/**
 * Human Tasks:
 * 1. Verify API endpoints are correctly configured in the environment
 * 2. Review error handling and retry strategies for production use
 * 3. Confirm workflow validation rules match business requirements
 */

// axios version ^1.3.4
import axios from 'axios';
import { getApiEndpoint } from '../config/api.config';
import { validateWorkflowData } from '../utils/validation.util';
import { Workflow } from '../types/workflow.types';

/**
 * Fetches a list of workflows from the backend API.
 * @returns Promise resolving to an array of workflow objects
 * @throws Error if the API request fails or returns invalid data
 */
export const getWorkflows = async (): Promise<Workflow[]> => {
    try {
        // Construct the API endpoint URL for fetching workflows
        const endpoint = getApiEndpoint('workflows');

        // Send GET request to the backend API
        const response = await axios.get<Workflow[]>(endpoint);

        // Validate each workflow in the response data
        const validWorkflows = response.data.filter(workflow => 
            validateWorkflowData(workflow)
        );

        if (validWorkflows.length !== response.data.length) {
            console.warn('Some workflows failed validation and were filtered out');
        }

        return validWorkflows;
    } catch (error) {
        console.error('Error fetching workflows:', error);
        throw new Error('Failed to fetch workflows');
    }
};

/**
 * Creates a new workflow by sending data to the backend API.
 * @param workflowData - The workflow data to create
 * @returns Promise resolving to the created workflow object
 * @throws Error if validation fails or the API request fails
 */
export const createWorkflow = async (workflowData: Workflow): Promise<Workflow> => {
    // Validate the workflow data before sending to the API
    if (!validateWorkflowData(workflowData)) {
        throw new Error('Invalid workflow data');
    }

    try {
        // Construct the API endpoint URL for creating a workflow
        const endpoint = getApiEndpoint('workflows');

        // Send POST request to the backend API
        const response = await axios.post<Workflow>(endpoint, workflowData);

        // Validate the response data
        if (!validateWorkflowData(response.data)) {
            throw new Error('Invalid workflow data received from server');
        }

        return response.data;
    } catch (error) {
        console.error('Error creating workflow:', error);
        throw new Error('Failed to create workflow');
    }
};

/**
 * Updates an existing workflow by sending updated data to the backend API.
 * @param workflowData - The updated workflow data
 * @returns Promise resolving to the updated workflow object
 * @throws Error if validation fails or the API request fails
 */
export const updateWorkflow = async (workflowData: Workflow): Promise<Workflow> => {
    // Validate the workflow data before sending to the API
    if (!validateWorkflowData(workflowData)) {
        throw new Error('Invalid workflow data');
    }

    try {
        // Construct the API endpoint URL for updating a workflow
        const endpoint = getApiEndpoint(`workflows/${workflowData.workflowId}`);

        // Send PUT request to the backend API
        const response = await axios.put<Workflow>(endpoint, workflowData);

        // Validate the response data
        if (!validateWorkflowData(response.data)) {
            throw new Error('Invalid workflow data received from server');
        }

        return response.data;
    } catch (error) {
        console.error('Error updating workflow:', error);
        throw new Error('Failed to update workflow');
    }
};

/**
 * Deletes a workflow by sending a request to the backend API.
 * @param workflowId - The ID of the workflow to delete
 * @returns Promise that resolves when the workflow is successfully deleted
 * @throws Error if the API request fails
 */
export const deleteWorkflow = async (workflowId: string): Promise<void> => {
    if (!workflowId || typeof workflowId !== 'string' || workflowId.trim() === '') {
        throw new Error('Invalid workflow ID');
    }

    try {
        // Construct the API endpoint URL for deleting a workflow
        const endpoint = getApiEndpoint(`workflows/${workflowId}`);

        // Send DELETE request to the backend API
        await axios.delete(endpoint);
    } catch (error) {
        console.error('Error deleting workflow:', error);
        throw new Error('Failed to delete workflow');
    }
};