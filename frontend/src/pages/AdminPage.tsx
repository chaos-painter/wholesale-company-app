import { useState } from "react";
import InventoryTab from "../components/admin/InventoryTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import OrdersTab from "../components/admin/OrdersTab";
import WarehousesTab from "../components/admin/WarehousesTab";
import UsersTab from "../components/admin/UsersTab";

type Tab = "inventory" | "categories" | "orders" | "warehouses" | "users";

const TABS: { key: Tab; label: string }[] = [
  { key: "inventory", label: "Товары" },
  { key: "categories", label: "Категории" },
  { key: "orders", label: "Заказы" },
  { key: "warehouses", label: "Склады" },
  { key: "users", label: "Пользователи" },
];

const TAB_COMPONENTS: Record<Tab, React.FC> = {
  inventory: InventoryTab,
  categories: CategoriesTab,
  orders: OrdersTab,
  warehouses: WarehousesTab,
  users: UsersTab,
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("inventory");
  const ActiveComponent = TAB_COMPONENTS[tab];

  return (
    <div className="max-w-275">
      <h2 className="mb-5 text-[#1a1a1a]">Панель управления</h2>

      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-1 border-b border-gray-200 mb-7 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0
              ${
                tab === t.key
                  ? "text-[#1a1a1a] border-[#1a1a1a] font-semibold"
                  : "text-gray-400 border-transparent hover:text-[#1a1a1a]"
              }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden mb-7">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] 
                     text-sm font-medium focus:outline-none focus:border-[#1a1a1a] 
                     focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors appearance-none
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22/%3E%3C/svg%3E')] 
                     bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
        >
          {TABS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <ActiveComponent />
      </div>
    </div>
  );
}
