import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesig`
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('starts unauthenticated with no stored token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBeNull()
    expect(result.current.role).toBeNull()
    expect(result.current.userId).toBeNull()
  })

  it('login stores token and updates state', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'test@test.com', role: 'customer', exp })
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login(token))

    expect(result.current.token).toBe(token)
    expect(result.current.email).toBe('test@test.com')
    expect(result.current.role).toBe('customer')
    expect(result.current.userId).toBe(1)
    expect(localStorage.getItem('token')).toBe(token)
  })

  it('logout clears state and localStorage', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'test@test.com', role: 'customer', exp })
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login(token))
    act(() => result.current.logout())

    expect(result.current.token).toBeNull()
    expect(result.current.role).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('ignores expired token on load', () => {
    const exp = Math.floor(Date.now() / 1000) - 1
    const token = makeJwt({ sub: 1, email: 'test@test.com', role: 'customer', exp })
    localStorage.setItem('token', token)

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBeNull()
  })

  it('restores valid token from localStorage', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 2, email: 'a@b.com', role: 'admin', exp })
    localStorage.setItem('token', token)

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBe(token)
    expect(result.current.role).toBe('admin')
  })

  it('isAdmin is true for admin role', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'a@b.com', role: 'admin', exp })
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login(token))
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isManager).toBe(true)
  })

  it('isManager is true for manager role', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'a@b.com', role: 'manager', exp })
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login(token))
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isManager).toBe(true)
  })

  it('isManager is false for customer role', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'a@b.com', role: 'customer', exp })
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login(token))
    expect(result.current.isManager).toBe(false)
  })
})
