import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'

vi.mock('../api/inventory', () => ({
  listInventory: vi.fn().mockResolvedValue([]),
  getInventoryItem: vi.fn(),
  createInventoryItem: vi.fn(),
  updateInventoryItem: vi.fn(),
  deleteInventoryItem: vi.fn(),
}))

vi.mock('../api/categories', () => ({
  listCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

vi.mock('../api/orders', () => ({
  listOrders: vi.fn().mockResolvedValue([]),
  getOrder: vi.fn(),
  createOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  deleteOrder: vi.fn(),
}))

vi.mock('../api/warehouses', () => ({
  listWarehouses: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
  localStorage.clear()
})

describe('App routing', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.getElementById('root') || document.body).toBeTruthy()
  })

  it('renders navbar on all pages', () => {
    render(<App />)
    expect(screen.getByText('WholesalePro')).toBeInTheDocument()
  })

  it('shows login and register links when not authenticated', () => {
    render(<App />)
    expect(screen.getAllByRole('link', { name: /войти/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /регистрация/i }).length).toBeGreaterThan(0)
  })

  it('shows catalog link in navbar', () => {
    render(<App />)
    expect(screen.getAllByRole('link', { name: /каталог/i }).length).toBeGreaterThan(0)
  })
})
