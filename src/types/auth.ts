export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'Finance'
  | 'HR'
  | 'Sales'
  | 'Purchase'
  | 'Inventory'
  | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  company: string;
  branch: string;
  department: string;
  permissions: string[];
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}
