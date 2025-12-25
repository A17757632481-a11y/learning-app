// 数据同步服务
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class SyncService {
  private syncInterval: number | null = null;
  private autoSyncEnabled = true;

  // 上传所有数据到服务器
  async uploadAll(): Promise<void> {
    if (!authService.isAuthenticated()) {
      throw new Error('请先登录');
    }

    // 获取所有localStorage数据
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('auth-')) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    const response = await fetch(`${API_URL}/sync/upload`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '数据上传失败');
    }

    const result = await response.json();
    console.log('Data uploaded:', result);
  }

  // 从服务器下载所有数据
  async downloadAll(): Promise<void> {
    if (!authService.isAuthenticated()) {
      throw new Error('请先登录');
    }

    const response = await fetch(`${API_URL}/sync/download`, {
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '数据下载失败');
    }

    const result = await response.json();
    const { data } = result;

    // 将数据写入localStorage
    Object.entries(data).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save key: ${key}`, error);
      }
    });

    console.log('Data downloaded:', result.count, 'items');
  }

  // 同步单个数据项
  async syncItem(key: string, value: any): Promise<void> {
    if (!authService.isAuthenticated()) {
      return; // 未登录时静默失败
    }

    try {
      const response = await fetch(`${API_URL}/sync/item`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        console.error('Failed to sync item:', key);
      }
    } catch (error) {
      console.error('Sync item error:', error);
    }
  }

  // 启动自动同步（每5分钟）
  startAutoSync() {
    if (this.syncInterval) {
      return;
    }

    this.autoSyncEnabled = true;
    this.syncInterval = window.setInterval(() => {
      if (this.autoSyncEnabled && authService.isAuthenticated()) {
        this.uploadAll().catch(err => {
          console.error('Auto sync failed:', err);
        });
      }
    }, 5 * 60 * 1000); // 5分钟

    console.log('Auto sync started');
  }

  // 停止自动同步
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.autoSyncEnabled = false;
      console.log('Auto sync stopped');
    }
  }

  // 手动触发同步
  async manualSync(): Promise<void> {
    await this.uploadAll();
  }

  // 合并本地和服务器数据
  async mergeData(): Promise<void> {
    if (!authService.isAuthenticated()) {
      throw new Error('请先登录');
    }

    // 先下载服务器数据
    const response = await fetch(`${API_URL}/sync/download`, {
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取服务器数据失败');
    }

    const result = await response.json();
    const serverData = result.data;

    // 获取本地数据
    const localData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('auth-')) {
        try {
          const value = localStorage.getItem(key);
          localData[key] = value ? JSON.parse(value) : value;
        } catch {
          localData[key] = localStorage.getItem(key);
        }
      }
    }

    // 合并数据（本地优先）
    const mergedData = { ...serverData, ...localData };

    // 保存到本地
    Object.entries(mergedData).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save key: ${key}`, error);
      }
    });

    // 上传合并后的数据
    await this.uploadAll();

    console.log('Data merged successfully');
  }
}

export const syncService = new SyncService();
