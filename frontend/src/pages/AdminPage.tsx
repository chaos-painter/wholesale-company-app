import { useState } from "react";
import InventoryTab from "../components/admin/InventoryTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import OrdersTab from "../components/admin/OrdersTab";
import WarehousesTab from "../components/admin/WarehousesTab";
import UsersTab from "../components/admin/UsersTab";
import MainLayout from "../components/layouts/MainLayout";

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
    <MainLayout>
      <div className="max-w-275">
        <h2 className="mb-5 text-[#1a1a1a]">Панель управления</h2>

        <div className="hidden md:flex gap-1 border-b border-gray-200 mb-7 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
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

        <div className="md:hidden mb-7">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm font-medium focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors"
          >
            {TABS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <ActiveComponent />
      </div>
    </MainLayout>
  );
}
