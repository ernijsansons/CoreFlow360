/**
 * CoreFlow360 - Customer API Endpoint Documentation
 */

export const customerEndpoints = {
  '/api/customers': {
    get: {
      tags: ['Customers'],
      summary: 'List customers',
      description: 'Get a paginated list of customers with optional filtering',
      operationId: 'listCustomers',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search customers by name, email, or company',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by customer status',
          schema: {
            type: 'string',
            enum: ['active', 'inactive', 'lead', 'prospect'],
          },
        },
        {
          name: 'industry',
          in: 'query',
          description: 'Filter by industry',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Sort field',
          schema: {
            type: 'string',
            enum: ['name', 'email', 'createdAt', 'value', 'lastContact'],
            default: 'createdAt',
          },
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
        },
      ],
      responses: {
        200: {
          description: 'Customer list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Customer',
                    },
                  },
                  meta: {
                    $ref: '#/components/schemas/PaginationMeta',
                  },
                },
              },
              example: {
                data: [
                  {
                    id: 'cust_123',
                    name: 'Acme Corporation',
                    email: 'contact@acme.com',
                    company: 'Acme Corp',
                    status: 'active',
                    industry: 'Technology',
                    value: 150000,
                    lastContact: '2024-01-15T10:30:00Z',
                    createdAt: '2023-06-01T08:00:00Z',
                  },
                ],
                meta: {
                  page: 1,
                  limit: 20,
                  total: 150,
                  totalPages: 8,
                  hasNext: true,
                  hasPrev: false,
                },
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        429: {
          $ref: '#/components/responses/RateLimited',
        },
      },
    },
    post: {
      tags: ['Customers'],
      summary: 'Create customer',
      description: 'Create a new customer record',
      operationId: 'createCustomer',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email'],
              properties: {
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
                company: {
                  type: 'string',
                  maxLength: 100,
                },
                phone: {
                  type: 'string',
                  pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
                },
                status: {
                  type: 'string',
                  enum: ['lead', 'prospect', 'active', 'inactive'],
                  default: 'lead',
                },
                industry: {
                  type: 'string',
                },
                website: {
                  type: 'string',
                  format: 'uri',
                },
                notes: {
                  type: 'string',
                  maxLength: 1000,
                },
                customFields: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
            example: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              company: 'Example Inc',
              phone: '+1-555-0123',
              status: 'prospect',
              industry: 'Software',
              website: 'https://example.com',
              notes: 'Interested in enterprise plan',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Customer created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                  },
                  data: {
                    $ref: '#/components/schemas/Customer',
                  },
                },
              },
            },
          },
        },
        400: {
          $ref: '#/components/responses/BadRequest',
        },
        409: {
          description: 'Customer already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Conflict',
                message: 'A customer with this email already exists',
              },
            },
          },
        },
      },
    },
  },
  '/api/customers/{id}': {
    get: {
      tags: ['Customers'],
      summary: 'Get customer by ID',
      description: 'Retrieve a specific customer by their ID',
      operationId: 'getCustomer',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Customer ID',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: 'Customer retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Customer',
              },
            },
          },
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
    put: {
      tags: ['Customers'],
      summary: 'Update customer',
      description: 'Update an existing customer record',
      operationId: 'updateCustomer',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Customer ID',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
                company: {
                  type: 'string',
                },
                phone: {
                  type: 'string',
                },
                status: {
                  type: 'string',
                  enum: ['lead', 'prospect', 'active', 'inactive'],
                },
                industry: {
                  type: 'string',
                },
                website: {
                  type: 'string',
                  format: 'uri',
                },
                notes: {
                  type: 'string',
                },
                customFields: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Customer updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                  },
                  data: {
                    $ref: '#/components/schemas/Customer',
                  },
                },
              },
            },
          },
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
    delete: {
      tags: ['Customers'],
      summary: 'Delete customer',
      description: 'Delete a customer record',
      operationId: 'deleteCustomer',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Customer ID',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: 'Customer deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        404: {
          $ref: '#/components/responses/NotFound',
        },
      },
    },
  },
}

export const customerSchemas = {
  Customer: {
    type: 'object',
    required: ['id', 'name', 'email', 'status'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique customer identifier',
      },
      name: {
        type: 'string',
        description: 'Customer full name',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Customer email address',
      },
      company: {
        type: 'string',
        description: 'Company name',
        nullable: true,
      },
      phone: {
        type: 'string',
        description: 'Phone number',
        nullable: true,
      },
      status: {
        type: 'string',
        enum: ['lead', 'prospect', 'active', 'inactive'],
        description: 'Customer status',
      },
      industry: {
        type: 'string',
        description: 'Industry sector',
        nullable: true,
      },
      value: {
        type: 'number',
        description: 'Total customer value',
        minimum: 0,
      },
      lastContact: {
        type: 'string',
        format: 'date-time',
        description: 'Last contact date',
        nullable: true,
      },
      website: {
        type: 'string',
        format: 'uri',
        description: 'Company website',
        nullable: true,
      },
      notes: {
        type: 'string',
        description: 'Internal notes',
        nullable: true,
      },
      customFields: {
        type: 'object',
        description: 'Industry-specific custom fields',
        additionalProperties: true,
      },
      tenantId: {
        type: 'string',
        description: 'Tenant identifier',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
      },
    },
  },
}
