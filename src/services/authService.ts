// 认证服务
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // 从localStorage恢复登录状态
    this.token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch {
        this.user = null;
      }
    }
  }

  // 注册
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '注册失败');
      }

      const data: AuthResponse = await response.json();
      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请确保后端服务已启动（http://localhost:3001）');
      }
      throw error;
    }
  }

  // 登录
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登录失败');
      }

      const data: AuthResponse = await response.json();
      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请确保后端服务已启动（http://localhost:3001）');
      }
      throw error;
    }
  }

  // 登出
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  }

  // 获取当前用户
  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('未登录');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.logout();
      }
      throw new Error('获取用户信息失败');
    }

    const data = await response.json();
    this.user = data.user;
    localStorage.setItem('auth-user', JSON.stringify(this.user));
    return data.user;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // 获取token
  getToken(): string | null {
    return this.token;
  }

  // 获取用户信息
  getUser(): User | null {
    return this.user;
  }

  // 设置认证信息
  private setAuth(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
  }

  // 获取认证头
  getAuthHeaders(): HeadersInit {
    if (!this.token) {
      throw new Error('未登录');
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}

export const authService = new AuthService();
