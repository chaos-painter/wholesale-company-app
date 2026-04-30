import { useState, useCallback } from 'react'
import { listOrders, getOrder, updateOrderStatus } from '../api/orders'
import { getInventoryItem } from '../api/inventory'
import type { Order, OrderItem, InventoryItem } from '../types'

type OrderWithDetails = {
  order: Order
  items: (OrderItem & { product?: InventoryItem })[]
}

interface UseOrdersReturn {
  orders: OrderWithDetails[]
  loading: boolean
  error: string | null
  loadOrders: () => Promise<void>
  updateStatus: (orderId: number, status: string) => Promise<void>
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const orderList = await listOrders()
      const ordersWithItems = await Promise.all(
        orderList.map(async (order) => {
          try {
            const [orderData, items] = await getOrder(order.id)
            const itemsWithProducts = await Promise.all(
              items.map(async (item) => {
                try {
                  const product = await getInventoryItem(item.inventory_id)
                  return { ...item, product }
                } catch {
                  return item
                }
              })
            )
            return { order: orderData, items: itemsWithProducts }
          } catch {
            return { order, items: [] }
          }
        })
      )
      setOrders(ordersWithItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status)
    setOrders((prev) =>
      prev.map((o) =>
        o.order.id === orderId ? { ...o, order: { ...o.order, status } } : o
      )
    )
  }, [])

  return { orders, loading, error, loadOrders, updateStatus }
}