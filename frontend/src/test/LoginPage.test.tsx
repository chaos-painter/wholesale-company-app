import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import LoginPage from '../pages/LoginPage'
import type { ReactNode } from 'react'

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesig`
}

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

import { login } from '../api/auth'
const mockLogin = vi.mocked(login)

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(
      <Wrapper>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
  })

  it('navigates to /catalog on successful login', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJwt({ sub: 1, email: 'user@test.com', role: 'customer', exp })
    mockLogin.mockResolvedValueOnce({ token })

    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalog" element={<div>catalog page</div>} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    )

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() =>
      expect(screen.getByText('catalog page')).toBeInTheDocument()
    )
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Неверный email или пароль'))

    render(
      <Wrapper>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Wrapper>
    )

    await userEvent.type(screen.getByLabelText('Email'), 'bad@test.com')
    await userEvent.type(screen.getByLabelText('Пароль'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() =>
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
    )
  })

  it('has a link to register page', () => {
    render(
      <Wrapper>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Wrapper>
    )
    expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })
})
