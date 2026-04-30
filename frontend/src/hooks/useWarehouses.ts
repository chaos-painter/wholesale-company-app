import { useState, useCallback } from 'react'
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../api/warehouses'
import type { Warehouse } from '../types'

interface UseWarehousesReturn {
  warehouses: Warehouse[]
  loading: boolean
  error: string | null
  loadWarehouses: () => Promise<void>
  addWarehouse: (data: { location_name: string; address?: string; capacity?: number }) => Promise<void>
  updateWarehouse: (id: number, data: { location_name?: string; address?: string; capacity?: number }) => Promise<void>
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

  const addWarehouse = useCallback(async (data: { location_name: string; address?: string; capacity?: number }) => {
    await createWarehouse(data)
    await loadWarehouses()
  }, [loadWarehouses])

  const updateWarehouse = useCallback(async (id: number, data: { location_name?: string; address?: string; capacity?: number }) => {
    await updateWarehouse(id, data)
    await loadWarehouses()
  }, [loadWarehouses])

  const removeWarehouse = useCallback(async (id: number) => {
    await deleteWarehouse(id)
    await loadWarehouses()
  }, [loadWarehouses])

  return { warehouses, loading, error, loadWarehouses, addWarehouse, updateWarehouse, removeWarehouse }
}