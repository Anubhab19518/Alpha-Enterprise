import { ApiResponse, AuthResponse } from '@/types/api';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (error) {
      console.error('Customer login error:', error);
      return {
        status: 'error',
        message: 'Network error during login. Please try again.',
        data: null as unknown as AuthResponse,
      };
    }
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      return await res.json();
    } catch (error) {
      console.error('Customer registration error:', error);
      return {
        status: 'error',
        message: 'Network error during registration. Please try again.',
        data: null as unknown as AuthResponse,
      };
    }
  },
};
