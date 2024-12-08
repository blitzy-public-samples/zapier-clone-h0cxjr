/**
 * @fileoverview Unit tests for the API service
 * Requirements addressed:
 * - API Request Management Testing (Technical Specification/System Design/API Design)
 *   Ensures that the API service correctly handles requests, configurations, and error scenarios.
 */

/**
 * Human Tasks:
 * 1. Review test coverage thresholds and adjust if needed
 * 2. Verify mock data matches production API response structures
 * 3. Add additional test cases for specific error scenarios if required
 */

// jest version: ^29.0.0
// axios-mock-adapter version: ^1.20.0
import { makeRequest, get, post } from '../../../src/services/api.service';
import { getApiEndpoint } from '../../../src/config/api.config';
import { validateAuthData } from '../../../src/utils/validation.util';
import { API_TIMEOUT, DEFAULT_HEADERS } from '../../../src/constants/api.constants';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create axios mock
const mockAxios = new MockAdapter(axios);

// Mock the imported functions
jest.mock('../../../src/config/api.config');
jest.mock('../../../src/utils/validation.util');
jest.mock('../../../src/constants/api.constants', () => ({
  API_TIMEOUT: 5000,
  DEFAULT_HEADERS: { 'Content-Type': 'application/json' }
}));

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockAxios.reset();
    jest.clearAllMocks();
    (getApiEndpoint as jest.Mock).mockImplementation((path) => `http://api.example.com/${path}`);
  });

  describe('makeRequest', () => {
    it('handles successful responses', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      const config = {
        method: 'GET',
        url: 'test-endpoint'
      };

      mockAxios.onAny().reply(200, mockResponse);

      const result = await makeRequest(config);

      expect(result).toEqual(mockResponse);
      expect(getApiEndpoint).toHaveBeenCalledWith('test-endpoint');
    });

    it('merges default headers and timeout correctly', async () => {
      const customHeaders = { 'X-Custom-Header': 'test' };
      const config = {
        method: 'GET',
        url: 'test-endpoint',
        headers: customHeaders
      };

      mockAxios.onAny().reply(200, {});

      await makeRequest(config);

      const lastRequest = mockAxios.history.get[0];
      expect(lastRequest.headers).toEqual({
        ...DEFAULT_HEADERS,
        ...customHeaders
      });
      expect(lastRequest.timeout).toBe(API_TIMEOUT);
    });

    it('handles axios errors with response data', async () => {
      const errorResponse = {
        message: 'Invalid request',
        code: 'ERR_001'
      };
      const config = {
        method: 'GET',
        url: 'test-endpoint'
      };

      mockAxios.onAny().reply(400, errorResponse);

      await expect(makeRequest(config)).rejects.toThrow('Invalid request');
    });

    it('handles axios errors without response data', async () => {
      const config = {
        method: 'GET',
        url: 'test-endpoint'
      };

      mockAxios.onAny().networkError();

      await expect(makeRequest(config)).rejects.toThrow('Network Error');
    });
  });

  describe('get', () => {
    it('constructs correct API URL and sends GET request', async () => {
      const endpoint = 'test-endpoint';
      const params = { id: 1 };
      const mockResponse = { data: { result: 'success' } };

      mockAxios.onGet().reply(200, mockResponse);

      const result = await get(endpoint, params);

      expect(result).toEqual(mockResponse);
      expect(getApiEndpoint).toHaveBeenCalledWith(endpoint);
      
      const lastRequest = mockAxios.history.get[0];
      expect(lastRequest.params).toEqual(params);
    });

    it('handles GET request errors', async () => {
      const endpoint = 'test-endpoint';
      mockAxios.onGet().reply(500);

      await expect(get(endpoint)).rejects.toThrow();
    });
  });

  describe('post', () => {
    it('sends correct data in POST request', async () => {
      const endpoint = 'test-endpoint';
      const postData = { test: 'data' };
      const mockResponse = { data: { id: 1 } };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await post(endpoint, postData);

      expect(result).toEqual(mockResponse);
      expect(getApiEndpoint).toHaveBeenCalledWith(endpoint);
      
      const lastRequest = mockAxios.history.post[0];
      expect(JSON.parse(lastRequest.data)).toEqual(postData);
    });

    it('validates auth data when present', async () => {
      const endpoint = 'auth-endpoint';
      const authData = {
        username: 'testuser',
        password: 'testpass'
      };

      (validateAuthData as jest.Mock).mockReturnValue(true);
      mockAxios.onPost().reply(200, {});

      await post(endpoint, authData);

      expect(validateAuthData).toHaveBeenCalledWith(authData);
    });

    it('throws error when auth data is invalid', async () => {
      const endpoint = 'auth-endpoint';
      const authData = {
        username: 'testuser',
        password: 'testpass'
      };

      (validateAuthData as jest.Mock).mockReturnValue(false);

      await expect(post(endpoint, authData)).rejects.toThrow('Invalid authentication data provided');
    });

    it('handles POST request errors', async () => {
      const endpoint = 'test-endpoint';
      const postData = { test: 'data' };
      mockAxios.onPost().reply(500);

      await expect(post(endpoint, postData)).rejects.toThrow();
    });
  });
});