export const ORDER_STATUS = {
  pending: {
    label: 'Ожидает',
    color: 'bg-[rgba(245,158,11,0.1)] text-[#b45309] border-[#b45309]',
  },
  confirmed: {
    label: 'Подтверждён',
    color: 'bg-[rgba(59,130,246,0.1)] text-[#1d4ed8] border-[#1d4ed8]',
  },
  shipped: {
    label: 'Отправлен',
    color: 'bg-[rgba(139,92,246,0.1)] text-[#6d28d9] border-[#6d28d9]',
  },
  delivered: {
    label: 'Доставлен',
    color: 'bg-[rgba(16,185,129,0.1)] text-[#059669] border-[#059669]',
  },
  cancelled: {
    label: 'Отменён',
    color: 'bg-[rgba(239,68,68,0.08)] text-[#dc2626] border-[#dc2626]',
  },
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS) as OrderStatus[]