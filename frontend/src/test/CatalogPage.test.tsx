import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import CatalogPage from '../pages/CatalogPage'
import type { ReactNode } from 'react'
import type { InventoryItem, Category } from '../types'

vi.mock('../api/inventory', () => ({
  listInventory: vi.fn(),
  getInventoryItem: vi.fn(),
  createInventoryItem: vi.fn(),
  updateInventoryItem: vi.fn(),
  deleteInventoryItem: vi.fn(),
}))

vi.mock('../api/categories', () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

import { listInventory } from '../api/inventory'
import { listCategories } from '../api/categories'
const mockListInventory = vi.mocked(listInventory)
const mockListCategories = vi.mocked(listCategories)

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
  mockListCategories.mockResolvedValue([])
})

const sampleCategories: Category[] = [
  { id: 1, category: 'Электроника' },
]

const sampleItems: InventoryItem[] = [
  {
    id: 1,
    item_name: 'Ноутбук',
    unit_price: '50000.00',
    quantity: 10,
    sku: 'NB-001',
    category_id: 1,
    created_at: '',
    updated_at: '',
  },
  {
    id: 2,
    item_name: 'Мышь',
    unit_price: '1500.00',
    quantity: 0,
    created_at: '',
    updated_at: '',
  },
]

describe('CatalogPage', () => {
  it('shows loading skeletons while fetching', () => {
    mockListInventory.mockReturnValue(new Promise(() => {}))
    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )
    expect(document.querySelectorAll('.skeleton-card').length).toBeGreaterThan(0)
  })

  it('renders inventory items after loading', async () => {
    mockListInventory.mockResolvedValue(sampleItems)
    mockListCategories.mockResolvedValue(sampleCategories)

    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )

    await waitFor(() => expect(screen.getByText('Ноутбук')).toBeInTheDocument())
    expect(screen.getByText('Мышь')).toBeInTheDocument()
  })

  it('shows category in sidebar', async () => {
    mockListInventory.mockResolvedValue(sampleItems)
    mockListCategories.mockResolvedValue(sampleCategories)

    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Электроника' })).toBeInTheDocument()
    )
  })

  it('shows empty state when no items', async () => {
    mockListInventory.mockResolvedValue([])

    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )

    await waitFor(() => expect(screen.getByText('Товары не найдены')).toBeInTheDocument())
  })

  it('shows error banner when API fails', async () => {
    mockListInventory.mockRejectedValue(new Error('Ошибка сервера'))

    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )

    await waitFor(() => expect(screen.getByText('Ошибка сервера')).toBeInTheDocument())
  })

  it('shows "Нет в наличии" for out-of-stock items', async () => {
    mockListInventory.mockResolvedValue(sampleItems)
    mockListCategories.mockResolvedValue(sampleCategories)

    render(
      <Wrapper>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </Wrapper>
    )

    await waitFor(() => expect(screen.getByText('Нет в наличии')).toBeInTheDocument())
  })
})
