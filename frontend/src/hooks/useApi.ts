import { useState, useCallback } from 'react'

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (promise: Promise<T>) => Promise<T>
  setData: (data: T | null) => void
  clearError: () => void
}

export function useApi<T>(initialData: T | null = null): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (promise: Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await promise
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { data, loading, error, execute, setData, clearError }
}