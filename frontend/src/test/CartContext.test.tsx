import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CartProvider, useCart } from '../context/CartContext'
import type { ReactNode } from 'react'
import type { InventoryItem } from '../types'

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

function makeItem(id: number, price = '10.00', qty = 100): InventoryItem {
  return {
    id,
    item_name: `Item ${id}`,
    unit_price: price,
    quantity: qty,
    created_at: '',
    updated_at: '',
  }
}

describe('CartContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
    expect(result.current.count).toBe(0)
  })

  it('add inserts a new item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1), 2))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.count).toBe(2)
  })

  it('add increments quantity for duplicate item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const item = makeItem(1)
    act(() => result.current.add(item, 1))
    act(() => result.current.add(item, 3))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(4)
  })

  it('add respects stock limit', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1, '10.00', 5), 99))
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('remove deletes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1)))
    act(() => result.current.add(makeItem(2)))
    act(() => result.current.remove(1))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].item.id).toBe(2)
  })

  it('updateQty changes quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1), 1))
    act(() => result.current.updateQty(1, 5))
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('updateQty with 0 removes item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1), 3))
    act(() => result.current.updateQty(1, 0))
    expect(result.current.items).toHaveLength(0)
  })

  it('clear empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1)))
    act(() => result.current.add(makeItem(2)))
    act(() => result.current.clear())
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('total is sum of price * quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(makeItem(1, '5.00'), 2))
    act(() => result.current.add(makeItem(2, '3.00'), 4))
    expect(result.current.total).toBe(22)
  })
})
