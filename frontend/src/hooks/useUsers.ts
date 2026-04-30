import { useState, useCallback } from 'react'
import { listUsers, createUser, updateUser, deleteUser } from '../api/users'
import { listRoles } from '../api/roles'
import type { User, Role } from '../types'
import type { UserFilters } from '../api/users'

interface UseUsersReturn {
  users: User[]
  roles: Role[]
  loading: boolean
  error: string | null
  loadUsers: (filters?: UserFilters) => Promise<void>
  addUser: (data: { email: string; password: string; real_name?: string; role_id?: number }) => Promise<void>
  updateUser: (id: number, data: Partial<User>) => Promise<void>
  removeUser: (id: number) => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async (filters: UserFilters = { limit: 100 }) => {
    setLoading(true)
    setError(null)
    try {
      const [userList, roleList] = await Promise.all([listUsers(filters), listRoles()])
      setUsers(userList)
      setRoles(roleList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  const addUser = useCallback(async (data: { email: string; password: string; real_name?: string; role_id?: number }) => {
    await createUser(data)
    await loadUsers()
  }, [loadUsers])

  const updateUser = useCallback(async (id: number, data: Partial<User>) => {
    await updateUser(id, data)
    await loadUsers()
  }, [loadUsers])

  const removeUser = useCallback(async (id: number) => {
    await deleteUser(id)
    await loadUsers()
  }, [loadUsers])

  return { users, roles, loading, error, loadUsers, addUser, updateUser, removeUser }
}