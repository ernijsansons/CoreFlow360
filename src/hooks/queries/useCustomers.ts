/**
 * CoreFlow360 - Customer React Query Hooks
 * Provides data fetching and mutation hooks for customers
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@/types/api'
import { broadcastSync } from '@/lib/broadcast-sync'

interface CustomersResponse {
  data: Customer[]
  meta: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

interface CustomerFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Query keys factory
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
}

/**
 * Hook to fetch customers list with pagination and filtering
 */
export function useCustomers(filters?: CustomerFilters, options?: UseQueryOptions<CustomersResponse>) {
  return useQuery<CustomersResponse>({
    queryKey: customerKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await api.get(`/api/customers?${params.toString()}`)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch customers')
      }
      
      return response.data as CustomersResponse
    },
    ...options,
  })
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: string | null | undefined, options?: UseQueryOptions<Customer>) {
  return useQuery<Customer>({
    queryKey: customerKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required')
      
      const response = await api.get(`/api/customers/${id}`)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch customer')
      }
      
      return response.data as Customer
    },
    enabled: !!id,
    ...options,
  })
}

/**
 * Hook to create a new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateCustomerInput) => {
      const response = await api.post('/api/customers', data)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create customer')
      }
      
      return response.data as Customer
    },
    onSuccess: (newCustomer) => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      
      // Optionally, add the new customer to the cache immediately
      queryClient.setQueryData(customerKeys.detail(newCustomer.id), newCustomer)
      
      // Notify other tabs about the new customer
      broadcastSync.notifyRefresh('customers')
    },
  })
}

/**
 * Hook to update an existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerInput }) => {
      const response = await api.put(`/api/customers/${id}`, data)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update customer')
      }
      
      return response.data as Customer
    },
    onSuccess: (updatedCustomer) => {
      // Update the customer in the cache
      queryClient.setQueryData(customerKeys.detail(updatedCustomer.id), updatedCustomer)
      
      // Invalidate customers list to reflect changes
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      
      // Notify other tabs about the update
      broadcastSync.notifyUpdate('customers', updatedCustomer.id, updatedCustomer)
    },
  })
}

/**
 * Hook to delete a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/customers/${id}`)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete customer')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove the customer from the cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(deletedId) })
      
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      
      // Notify other tabs about the deletion
      broadcastSync.notifyInvalidate('customers', deletedId)
    },
  })
}

/**
 * Hook to prefetch customers data
 */
export function usePrefetchCustomers() {
  const queryClient = useQueryClient()
  
  return (filters?: CustomerFilters) => {
    return queryClient.prefetchQuery({
      queryKey: customerKeys.list(filters),
      queryFn: async () => {
        const params = new URLSearchParams()
        
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.search) params.append('search', filters.search)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
        
        const response = await api.get(`/api/customers?${params.toString()}`)
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to prefetch customers')
        }
        
        return response.data as CustomersResponse
      },
    })
  }
}