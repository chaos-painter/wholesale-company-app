import { useState, useEffect, useCallback } from 'react'
import { listCategories, createCategory, deleteCategory } from '../api/categories'
import type { Category } from '../types'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  loadCategories: () => Promise<void>
  addCategory: (name: string) => Promise<void>
  removeCategory: (id: number) => Promise<void>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий')
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategory = useCallback(async (name: string) => {
    setError(null)
    try {
      const newCategory = await createCategory(name)
      setCategories((prev) => [...prev, newCategory])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания категории')
      throw err
    }
  }, [])

  const removeCategory = useCallback(async (id: number) => {
    setError(null)
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления категории')
      throw err
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return { categories, loading, error, loadCategories, addCategory, removeCategory }
}