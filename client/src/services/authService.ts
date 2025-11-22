import axios from 'axios';
import { User, AuthResponse, ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only redirect to login if:
        // 1. It's a 401 error
        // 2. It's NOT a login/register request (to avoid redirect loop)
        // 3. User was previously authenticated (has token)
        if (
          error.response?.status === 401 &&
          this.token &&
          !error.config?.url?.includes('/auth/login') &&
          !error.config?.url?.includes('/auth/register')
        ) {
          this.setToken(null);
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/login`, credentials);
      return response.data.data!;
    } catch (error: any) {
      // Provide clear error messages based on response
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 403) {
        throw new Error('Your account is inactive. Please contact support.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    title?: string;
    affiliation?: string;
    country?: string;
    orcid?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/register`, userData);
      return response.data.data!;
    } catch (error: any) {
      // Provide clear error messages based on response
      if (error.response?.status === 400) {
        if (error.response?.data?.error?.includes('already exists')) {
          throw new Error('An account with this email already exists. Please login instead.');
        } else if (error.response?.data?.details) {
          // Zod validation errors
          const validationErrors = error.response.data.details;
          const firstError = validationErrors[0];
          throw new Error(`Validation error: ${firstError.message}`);
        } else {
          throw new Error(error.response.data.error || 'Invalid registration data. Please check your information.');
        }
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error('Registration failed. Please try again later.');
      }
    }
  }

  async getProfile(): Promise<User> {
    const response = await axios.get<ApiResponse<User>>(`${API_URL}/auth/profile`);
    return response.data.data!;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await axios.put<ApiResponse<User>>(`${API_URL}/auth/profile`, userData);
    return response.data.data!;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
  }

  async resetPassword(password: string, token: string): Promise<void> {
    await axios.post(`${API_URL}/auth/reset-password`, { password, token });
  }
}

export const authService = new AuthService();