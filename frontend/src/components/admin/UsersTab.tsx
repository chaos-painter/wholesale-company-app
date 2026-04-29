import { useEffect, useState } from "react";
import { listUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { listRoles } from "../../api/roles";
import type { User, Role } from "../../types";

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<number | "">("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    real_name: "",
    role_id: "",
  });
  const [editForm, setEditForm] = useState({
    email: "",
    real_name: "",
    role_id: "",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const filters: any = {};
    if (roleFilter) filters.role_id = roleFilter;
    Promise.all([listUsers(filters), listRoles()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createUser({
      email: createForm.email,
      password: createForm.password,
      real_name: createForm.real_name || undefined,
      role_id: createForm.role_id ? Number(createForm.role_id) : undefined,
    }).catch(() => {});
    setCreateForm({ email: "", password: "", real_name: "", role_id: "" });
    setShowCreateForm(false);
    setSaving(false);
    load();
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      real_name: user.real_name ?? "",
      role_id: user.role_id ? String(user.role_id) : "",
    });
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    await updateUser(id, {
      email: editForm.email,
      real_name: editForm.real_name || null,
      role_id: editForm.role_id ? Number(editForm.role_id) : null,
    } as any).catch(() => {});
    setEditingId(null);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пользователя?")) return;
    await deleteUser(id).catch(() => {});
    load();
  };

  const getRoleName = (roleId: number | null) => {
    return roles.find((r) => r.id === roleId)?.role_name ?? "—";
  };

  if (loading)
    return <div className="py-16 text-center text-[#484848]">Загрузка...</div>;

  const inputClasses =
    "px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm placeholder:text-[#484848] focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors";
  const selectClasses =
    "px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-end gap-4 mb-7 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#1a1a1a]">
            Фильтр по роли
          </label>
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value ? Number(e.target.value) : "")
            }
            className={selectClasses}
          >
            <option value="">Все роли</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                     bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                     hover:bg-[#333] active:scale-[0.98]
                     disabled:opacity-55 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {showCreateForm ? "Отмена" : "Добавить пользователя"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
        >
          <h3 className="text-[#1a1a1a]">Новый пользователь</h3>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Email *
              </label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Пароль *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Имя
              </label>
              <input
                value={createForm.real_name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, real_name: e.target.value }))
                }
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Роль
              </label>
              <select
                value={createForm.role_id}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, role_id: e.target.value }))
                }
                className={selectClasses}
              >
                <option value="">— выбрать —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                       hover:bg-[#333] active:scale-[0.98]
                       disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200 self-start"
          >
            {saving ? "Создание..." : "Создать"}
          </button>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-3 px-5 py-3 
                        bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-[#484848] 
                        uppercase tracking-[0.5px]"
        >
          <span>ID</span>
          <span>Email</span>
          <span>Имя</span>
          <span>Роль</span>
          <span></span>
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-3 px-5 py-3 
                       border-b border-gray-200 text-sm last:border-b-0 items-center"
          >
            {editingId === user.id ? (
              <>
                <span className="text-[#484848]">#{user.id}</span>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={inputClasses}
                />
                <input
                  value={editForm.real_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, real_name: e.target.value }))
                  }
                  className={inputClasses}
                />
                <select
                  value={editForm.role_id}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role_id: e.target.value }))
                  }
                  className={selectClasses}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    disabled={saving}
                    onClick={() => handleUpdate(user.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                               bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-[13px]
                               hover:bg-[#333] active:scale-[0.98]
                               disabled:opacity-55 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                               border border-gray-300 text-[#1a1a1a] font-medium text-[13px]
                               hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                               transition-colors"
                  >
                    ❌
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[#484848]">#{user.id}</span>
                <span className="text-[#1a1a1a]">{user.email}</span>
                <span className="text-[#1a1a1a]">{user.real_name ?? "—"}</span>
                <span className="text-[#1a1a1a]">
                  {getRoleName(user.role_id)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                               border border-gray-300 text-[#1a1a1a] font-medium text-[13px]
                               hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                               transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                               bg-[rgba(239,68,68,0.08)] text-[#dc2626] 
                               border border-[rgba(239,68,68,0.2)] font-semibold text-[13px]
                               hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
