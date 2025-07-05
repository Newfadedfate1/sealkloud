export type UserRole = 'client' | 'employee_l1' | 'employee_l2' | 'employee_l3' | 'admin' | 'demo';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}