import { request } from './client';
import type { User } from '../types';

export interface LoginResponse { token: string }

export const login = (email: string, password: string) =>
  request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (email: string, password: string, real_name: string) =>
  request<User>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, real_name }) });
