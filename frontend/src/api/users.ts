import { request } from './client';
import type { User } from '../types';

export interface UserFilters {
  role_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const listUsers = (filters: UserFilters = {}) => {
  const p = new URLSearchParams();
  if (filters.role_id) p.set('role_id', String(filters.role_id));
  if (filters.search) p.set('search', filters.search);
  if (filters.page) p.set('page', String(filters.page));
  p.set('limit', String(filters.limit ?? 50));
  return request<User[]>(`/users?${p}`);
};

export const getUser = (id: number) => request<User>(`/users/${id}`);
export const getMyProfile = () => request<User>('/users/me');
export const createUser = (data: { email: string; password: string; real_name?: string; role_id?: number }) =>
  request<User>('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: number, data: Partial<User>) =>
  request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: number) =>
  request<null>(`/users/${id}`, { method: 'DELETE' });