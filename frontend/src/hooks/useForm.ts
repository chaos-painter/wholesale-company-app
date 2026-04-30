import { useState, useCallback } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  onSubmit: (values: T) => Promise<void>
  onSuccess?: () => void
}

interface UseFormReturn<T> {
  values: T
  loading: boolean
  error: string | null
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onSuccess,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)
      try {
        await onSubmit(values)
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка')
      } finally {
        setLoading(false)
      }
    },
    [values, onSubmit, onSuccess]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setError(null)
  }, [initialValues])

  return { values, loading, error, setValue, handleSubmit, reset }
}