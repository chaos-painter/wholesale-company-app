import { useState, useEffect, useCallback } from 'react'
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../api/warehouses'
import type { Warehouse } from '../types'

interface UseWarehousesReturn {
  warehouses: Warehouse[]
  loading: boolean
  error: string | null
  loadWarehouses: () => Promise<void>
  addWarehouse: (data: Partial<Warehouse>) => Promise<void>
  updateWarehouse: (id: number, data: Partial<Warehouse>) => Promise<void>
  removeWarehouse: (id: number) => Promise<void>
}

export function useWarehouses(): UseWarehousesReturn {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWarehouses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listWarehouses()
      setWarehouses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки складов')
    } finally {
      setLoading(false)
    }
  }, [])

  const addWarehouse = useCallback(async (data: Partial<Warehouse>) => {
    await createWarehouse(data)
    await loadWarehouses()
  }, [loadWarehouses])

  const updateWarehouseHandler = useCallback(async (id: number, data: Partial<Warehouse>) => {
    await updateWarehouse(id, data)
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data } : w))
    )
  }, [])

  const removeWarehouse = useCallback(async (id: number) => {
    await deleteWarehouse(id)
    setWarehouses((prev) => prev.filter((w) => w.id !== id))
  }, [])

  useEffect(() => {
    loadWarehouses()
  }, [loadWarehouses])

  return {
    warehouses,
    loading,
    error,
    loadWarehouses,
    addWarehouse,
    updateWarehouse: updateWarehouseHandler,
    removeWarehouse,
  }
}