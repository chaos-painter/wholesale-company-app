import { useState, useCallback } from 'react'
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../api/inventory'
import type { InventoryItem } from '../types'
import type { InventoryFilters } from '../api/inventory'

interface UseInventoryReturn {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  loadItems: (filters?: InventoryFilters) => Promise<void>
  addItem: (data: Partial<InventoryItem>) => Promise<void>
  updateItem: (id: number, data: Partial<InventoryItem>) => Promise<void>
  removeItem: (id: number) => Promise<void>
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async (filters: InventoryFilters = { limit: 100 }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listInventory(filters)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (data: Partial<InventoryItem>) => {
    await createInventoryItem(data)
    await loadItems()
  }, [loadItems])

  const updateItem = useCallback(async (id: number, data: Partial<InventoryItem>) => {
    await updateInventoryItem(id, data)
    await loadItems()
  }, [loadItems])

  const removeItem = useCallback(async (id: number) => {
    await deleteInventoryItem(id)
    await loadItems()
  }, [loadItems])

  return { items, loading, error, loadItems, addItem, updateItem, removeItem }
}