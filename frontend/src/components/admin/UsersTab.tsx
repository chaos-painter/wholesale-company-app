import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import ErrorBanner from "../ui/ErrorBanner";
import { ROLE_COLORS } from "../../shared/constants/roles";
import type { User } from "../../types";

export default function UsersTab() {
  const {
    users,
    roles,
    loading,
    error,
    loadUsers,
    addUser,
    updateUser,
    removeUser,
  } = useUsers();
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

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addUser({
      email: createForm.email,
      password: createForm.password,
      real_name: createForm.real_name || undefined,
      role_id: createForm.role_id ? Number(createForm.role_id) : undefined,
    }).catch(() => {});
    setCreateForm({ email: "", password: "", real_name: "", role_id: "" });
    setShowCreateForm(false);
    setSaving(false);
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
      real_name: editForm.real_name || undefined,
      role_id: editForm.role_id ? Number(editForm.role_id) : undefined,
    }).catch(() => {});
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пользователя?")) return;
    await removeUser(id).catch(() => {});
  };

  const getRoleName = (roleId: number | null) =>
    roles.find((r) => r.id === roleId)?.role_name ?? "—";

  if (loading)
    return <div className="py-16 text-center text-gray-400">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-end gap-4 mb-7 flex-wrap">
        <Select
          label="Фильтр по роли"
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Все роли</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.role_name}
            </option>
          ))}
        </Select>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Отмена" : "Добавить пользователя"}
        </Button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
        >
          <h3 className="text-[#1a1a1a]">Новый пользователь</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            <Input
              label="Email *"
              type="email"
              required
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <Input
              label="Пароль *"
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            <Input
              label="Имя"
              value={createForm.real_name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, real_name: e.target.value }))
              }
            />
            <Select
              label="Роль"
              value={createForm.role_id}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, role_id: e.target.value }))
              }
            >
              <option value="">— выбрать —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            className="self-start"
          >
            Создать
          </Button>
        </form>
      )}

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
          <span>ID</span>
          <span>Email</span>
          <span>Имя</span>
          <span>Роль</span>
          <span></span>
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-200 text-sm last:border-b-0 items-center"
          >
            {editingId === user.id ? (
              <>
                <span className="text-gray-400">#{user.id}</span>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
                <Input
                  value={editForm.real_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, real_name: e.target.value }))
                  }
                />
                <Select
                  value={editForm.role_id}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role_id: e.target.value }))
                  }
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={saving}
                    loading={saving}
                    onClick={() => handleUpdate(user.id)}
                  >
                    💾
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    ❌
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-gray-400">#{user.id}</span>
                <span className="text-[#1a1a1a]">{user.email}</span>
                <span className="text-[#1a1a1a]">{user.real_name ?? "—"}</span>
                <span className="text-[#1a1a1a]">
                  {getRoleName(user.role_id)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
