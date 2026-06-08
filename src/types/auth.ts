export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface User {
  id: number;
  login: string;
  first_name?: string;
  last_name?: string;
  is_manager: boolean;
}

export type UserCreate = Omit<User, 'id'> & {
  password?: string;
};

export type AuthUser = Omit<User, 'id'>;

export function isFullUser(user: AuthUser | User): user is User {
  return 'first_name' in user && user.first_name != null && 'last_name' in user && user.last_name != null;
}