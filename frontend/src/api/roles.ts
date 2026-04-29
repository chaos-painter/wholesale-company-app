import { request } from './client';
import type { Role } from '../types';

export const listRoles = () => request<Role[]>('/roles');
export const getRole = (id: number) => request<Role>(`/roles/${id}`);