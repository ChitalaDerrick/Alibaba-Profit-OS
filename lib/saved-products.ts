"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"

export interface SavedProduct {
  id: string
  name: string
  unitCost: number
  unitSale: number
  quantity: number
  shippingMethod: "AIR" | "SEA"
  netProfit: number
  margin: number
  savedAt: number
}

const STORAGE_KEY = "profit-os-saved-products"

let productsCache: SavedProduct[] = []

function loadFromStorage(): SavedProduct[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToStorage(products: SavedProduct[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function useSavedProducts() {
  const [isLoaded, setIsLoaded] = useState(false)

  const { data, mutate } = useSWR<SavedProduct[]>(
    "saved-products",
    () => productsCache,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    productsCache = loadFromStorage()
    mutate(productsCache, false)
    setIsLoaded(true)
  }, [mutate])

  const products = data ?? []

  const saveProduct = useCallback(
    (product: Omit<SavedProduct, "id" | "savedAt">) => {
      const newProduct: SavedProduct = {
        ...product,
        id: crypto.randomUUID(),
        savedAt: Date.now(),
      }
      productsCache = [newProduct, ...productsCache]
      saveToStorage(productsCache)
      mutate(productsCache, false)
    },
    [mutate]
  )

  const deleteProduct = useCallback(
    (id: string) => {
      productsCache = productsCache.filter((p) => p.id !== id)
      saveToStorage(productsCache)
      mutate(productsCache, false)
    },
    [mutate]
  )

  return {
    products,
    saveProduct,
    deleteProduct,
    isLoaded,
  }
}
