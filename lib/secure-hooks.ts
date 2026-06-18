'use client'

import { useCallback, useEffect, useState } from 'react'

interface SubscriptionData {
  tokenBalance: number
  remaining: number
}

interface Product {
  id: string
  productName: string
  unitCost: number
  unitSale: number
  quantity: number
  profitMargin: number
  totalProfit: number
  createdAt: string
}

interface CalculationResult {
  unitCost: number
  unitSale: number
  quantity: number
  profitPerUnit: number
  totalProfit: number
  profitMargin: string
}

interface CalculationResponse {
  success: boolean
  result: CalculationResult
  usage: {
    current: number
    limit: number
    remaining: number
  }
}

// Hook for secure calculations through API
export function useSecureCalculate() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback(
    async (
      unitCost: number,
      unitSale: number,
      quantity: number
    ): Promise<CalculationResponse | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitCost, unitSale, quantity }),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Calculation failed')
          return null
        }

        const data = (await response.json()) as CalculationResponse
        return data
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred'
        )
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { calculate, isLoading, error }
}

// Hook for managing saved products
export function useSavedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products')

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add product to database
  const addProduct = useCallback(
    async (product: {
      productName: string
      unitCost: number
      unitSale: number
      quantity: number
      profitMargin: number
      totalProfit: number
    }) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save product')
        }

        const data = await response.json()
        setProducts(prev => [data.product, ...prev])
        return data.product
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    []
  )

  // Delete product from database
  const deleteProduct = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [])

  return { products, isLoading, error, fetchProducts, addProduct, deleteProduct }
}

// Hook for subscription status
export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscription')

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { subscription, isLoading, error, fetchSubscription }
}
