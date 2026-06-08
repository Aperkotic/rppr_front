import { UserCreate } from '../types/auth';

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  first_name?: string;
  last_name?: string;
  is_manager?: boolean;  // ← ВАЖНО!
}

export const register = async (data: UserCreate) => {
  const response = await fetch(`/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Ошибка регистрации');
  }
  return response.json();
};

// ✅ Возвращаем LoginResponse с is_manager
export const login = async (loginName: string, password_str: string): Promise<LoginResponse> => {
  const body = new URLSearchParams();
  body.append('grant_type', '');
  body.append('username', loginName);
  body.append('password', password_str);
  body.append('scope', '');
  body.append('client_id', '');
  body.append('client_secret', '');

  const response = await fetch(`/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json',
    },
    body: body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Ошибка входа');
  }
  return response.json();
};

export const refresh = async (): Promise<LoginResponse> => {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Не удалось обновить сессию');
  }

  const data = (await response.json()) as LoginResponse;
  if (!data.access_token) {
    throw new Error('Сервер вернул пустой токен');
  }

  return data;
};