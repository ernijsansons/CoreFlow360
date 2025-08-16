/**
 * CoreFlow360 - Signed API Client
 * 
 * HTTP client for making authenticated requests with HMAC-SHA256 signatures
 * Ensures secure API communication for critical operations
 */

import { SignedHttpClient } from '@/lib/security/request-signing';

// Global signed client instance
export const signedApiClient = new SignedHttpClient({
  secretKey: process.env.API_SIGNING_SECRET || '',
  algorithm: 'sha256',
  timestampTolerance: 300,
  includeBody: true,
  headerName: 'x-coreflow-signature',
  timestampHeader: 'x-coreflow-timestamp'
});

// High security client for critical operations
export const highSecurityClient = new SignedHttpClient({
  secretKey: process.env.API_SIGNING_SECRET || '',
  algorithm: 'sha512',
  timestampTolerance: 60, // 1 minute
  includeBody: true,
  headerName: 'x-coreflow-signature',
  timestampHeader: 'x-coreflow-timestamp'
});

/**
 * Convenience methods for common API operations
 */
export class CoreFlowAPIClient {
  private client: SignedHttpClient;
  private baseUrl: string;

  constructor(baseUrl?: string, highSecurity = false) {
    this.client = highSecurity ? highSecurityClient : signedApiClient;
    this.baseUrl = baseUrl || (
      typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    );
  }

  /**
   * Make a signed GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await this.client.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      ...options
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a signed POST request
   */
  async post<T = any>(
    endpoint: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const body = data ? JSON.stringify(data) : undefined;
    
    const response = await this.client.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      body,
      ...options
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a signed PUT request
   */
  async put<T = any>(
    endpoint: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const body = data ? JSON.stringify(data) : undefined;
    
    const response = await this.client.fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      body,
      ...options
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a signed PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const body = data ? JSON.stringify(data) : undefined;
    
    const response = await this.client.fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      body,
      ...options
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a signed DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const response = await this.client.fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      ...options
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload file with signed request
   */
  async uploadFile<T = any>(
    endpoint: string,
    file: File | Blob,
    additionalData?: Record<string, any>,
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const response = await this.client.fetch(url, {
      method: 'POST',
      body: formData,
      ...options
    });

    return this.handleResponse<T>(response);
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
      } catch {
        // Use default error message
      }
      
      throw new Error(errorMessage);
    }

    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }
}

// Pre-configured clients for different security levels
export const standardApiClient = new CoreFlowAPIClient(undefined, false);
export const secureApiClient = new CoreFlowAPIClient(undefined, true);

/**
 * Utility functions for specific API operations
 */
export const apiOperations = {
  // Admin operations (high security)
  admin: {
    getUsers: () => secureApiClient.get('/api/admin/users'),
    getTenants: () => secureApiClient.get('/api/admin/tenants'),
    getWebhookDLQMetrics: () => secureApiClient.get('/api/admin/webhook-dlq/metrics'),
    retryWebhookEvent: (eventId: string) => 
      secureApiClient.post(`/api/admin/webhook-dlq/retry/${eventId}`),
    abandonWebhookEvent: (eventId: string, reason: string) => 
      secureApiClient.post(`/api/admin/webhook-dlq/abandon/${eventId}`, { reason }),
    getSignatureStats: () => secureApiClient.get('/api/admin/security/signatures')
  },

  // Customer operations (standard security)
  customers: {
    list: (params?: any) => standardApiClient.get('/api/customers', { 
      method: 'GET',
      headers: params ? { 'X-Query-Params': JSON.stringify(params) } : undefined
    }),
    get: (id: string) => standardApiClient.get(`/api/customers/${id}`),
    create: (data: any) => standardApiClient.post('/api/customers', data),
    update: (id: string, data: any) => standardApiClient.put(`/api/customers/${id}`, data),
    delete: (id: string) => standardApiClient.delete(`/api/customers/${id}`)
  },

  // Subscription operations (high security)
  subscriptions: {
    getCurrent: () => secureApiClient.get('/api/subscriptions/current'),
    calculatePricing: (data: any) => secureApiClient.post('/api/subscriptions/calculate', data),
    createCheckout: (data: any) => secureApiClient.post('/api/subscriptions/checkout', data)
  },

  // Metrics operations (standard security)
  metrics: {
    getLive: () => standardApiClient.get('/api/metrics/live'),
    getSystem: () => standardApiClient.get('/api/metrics/system')
  }
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Generate test signature for API testing
   */
  generateTestSignature: (method: string, url: string, body?: string) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Test signature generation only available in development');
    }
    
    const { generateTestSignature } = require('@/middleware/request-signature');
    return generateTestSignature(method, url, body);
  },

  /**
   * Test API endpoint with signature
   */
  testSignedEndpoint: async (endpoint: string, method = 'GET', body?: any) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Test endpoint only available in development');
    }

    const client = new CoreFlowAPIClient();
    
    switch (method.toUpperCase()) {
      case 'GET':
        return client.get(endpoint);
      case 'POST':
        return client.post(endpoint, body);
      case 'PUT':
        return client.put(endpoint, body);
      case 'PATCH':
        return client.patch(endpoint, body);
      case 'DELETE':
        return client.delete(endpoint);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
};