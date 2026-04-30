export const ROLE_COLORS = {
  admin: 'bg-[rgba(239,68,68,0.12)] text-[#dc2626]',
  manager: 'bg-[rgba(245,158,11,0.1)] text-[#b45309]',
  customer: 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]',
} as const

export type RoleType = keyof typeof ROLE_COLORS