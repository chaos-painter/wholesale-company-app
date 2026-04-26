import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import ProtectedRoute from '../components/ProtectedRoute'
import type { ReactNode } from 'react'

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesig`
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

beforeEach(() => localStorage.clear())

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
            <Route path="/login" element={<div>login page</div>} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    localStorage.setItem('token', makeJwt({ sub: 1, email: 'a@b.com', role: 'customer', exp }))

    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
            <Route path="/login" element={<div>login page</div>} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('redirects non-manager to /catalog when requireManager', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    localStorage.setItem('token', makeJwt({ sub: 1, email: 'a@b.com', role: 'customer', exp }))

    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<ProtectedRoute requireManager><div>admin panel</div></ProtectedRoute>} />
            <Route path="/catalog" element={<div>catalog page</div>} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByText('catalog page')).toBeInTheDocument()
    expect(screen.queryByText('admin panel')).not.toBeInTheDocument()
  })

  it('renders admin content for manager role', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    localStorage.setItem('token', makeJwt({ sub: 1, email: 'a@b.com', role: 'manager', exp }))

    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<ProtectedRoute requireManager><div>admin panel</div></ProtectedRoute>} />
            <Route path="/catalog" element={<div>catalog page</div>} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByText('admin panel')).toBeInTheDocument()
  })
})
