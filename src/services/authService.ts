import { apiRequest } from './apiClient';
import { environment } from '../config/environment';
import { tokenStorage } from './tokenStorage';
import { User, LoginResponse, UserRole } from '../types/auth';
import { mockCurrentUser } from './mockData';

export const authService = {
  async login(usernameOrEmail: string, _password: string): Promise<LoginResponse> {
    if (environment.isMockMode) {
      // Return mock authenticated session with simulated DRF JWT tokens
      await new Promise((r) => setTimeout(r, 400));
      const tokens = {
        access: 'mock-jwt-access-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        refresh: 'mock-jwt-refresh-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };
      tokenStorage.setTokens(tokens);
      return {
        user: { ...mockCurrentUser, email: usernameOrEmail.includes('@') ? usernameOrEmail : mockCurrentUser.email },
        tokens,
      };
    }

    const res = await apiRequest<LoginResponse>(environment.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ username: usernameOrEmail, password: _password }),
    });

    if (res.tokens) {
      tokenStorage.setTokens(res.tokens);
    }
    return res;
  },

  async logout(): Promise<void> {
    tokenStorage.clearTokens();
  },

  async getCurrentUser(): Promise<User> {
    if (environment.isMockMode) {
      return mockCurrentUser;
    }
    return apiRequest<User>(environment.endpoints.auth.currentUser);
  },

  async switchRoleForTesting(newRole: UserRole, user: User): Promise<User> {
    const updated: User = {
      ...user,
      role: newRole,
      permissions: this.getRolePermissions(newRole),
    };
    return updated;
  },

  getRolePermissions(role: UserRole): string[] {
    switch (role) {
      case 'Admin':
        return ['*'];
      case 'Manager':
        return ['sales.view', 'sales.create', 'purchase.view', 'purchase.approve', 'inventory.view', 'finance.view', 'ai.use'];
      case 'Finance':
        return ['finance.view', 'finance.manage', 'finance.approve', 'sales.view', 'purchase.view', 'ai.use'];
      case 'Sales':
        return ['sales.view', 'sales.create', 'sales.manage', 'customers.manage', 'ai.use'];
      case 'Purchase':
        return ['purchase.view', 'purchase.create', 'vendors.manage', 'inventory.view', 'ai.use'];
      case 'Inventory':
        return ['inventory.view', 'inventory.adjust', 'purchase.view', 'ai.use'];
      case 'HR':
        return ['hr.view', 'hr.manage', 'hr.approve', 'ai.use'];
      case 'Employee':
      default:
        return ['dashboard.view', 'leave.apply', 'ai.use'];
    }
  },
};
