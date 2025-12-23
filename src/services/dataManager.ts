// 数据管理服务 - 支持导出/导入/备份
export class DataManager {
  // 获取所有学习数据
  static getAllData() {
    const data: Record<string, any> = {};
    
    // 遍历localStorage获取所有数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    return data;
  }

  // 导出数据为JSON文件
  static exportData() {
    const data = this.getAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  }

  // 导入数据从JSON文件
  static async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // 确认是否覆盖现有数据
      const hasExistingData = localStorage.length > 0;
      if (hasExistingData) {
        const confirm = window.confirm(
          '导入数据会覆盖当前所有学习进度，是否继续？\n建议先导出当前数据作为备份。'
        );
        if (!confirm) return false;
      }
      
      // 清空现有数据
      localStorage.clear();
      
      // 导入新数据
      Object.entries(data).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
          console.error(`Failed to import key: ${key}`, error);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      alert('导入失败：文件格式不正确');
      return false;
    }
  }

  // 获取数据统计信息
  static getDataStats() {
    const data = this.getAllData();
    
    return {
      totalKeys: Object.keys(data).length,
      vocabCount: data['vocab-words']?.length || 0,
      reviewCount: data['review-words']?.length || 0,
      wrongQuestionsCount: data['wrong-questions']?.length || 0,
      checkInDays: data['checkin-records']?.length || 0,
      lastBackup: data['last-backup-date'] || '从未备份',
    };
  }

  // 自动备份到localStorage（带时间戳）
  static autoBackup() {
    const data = this.getAllData();
    const backupKey = `auto-backup-${Date.now()}`;
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(data));
      localStorage.setItem('last-backup-date', new Date().toISOString());
      
      // 只保留最近3个自动备份
      this.cleanOldBackups();
      
      return true;
    } catch (error) {
      console.error('Auto backup failed:', error);
      return false;
    }
  }

  // 清理旧的自动备份
  private static cleanOldBackups() {
    const backupKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('auto-backup-')) {
        backupKeys.push(key);
      }
    }
    
    // 按时间戳排序，删除旧的备份
    backupKeys.sort().reverse();
    backupKeys.slice(3).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 恢复最近的自动备份
  static restoreLatestBackup(): boolean {
    const backupKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('auto-backup-')) {
        backupKeys.push(key);
      }
    }
    
    if (backupKeys.length === 0) {
      alert('没有找到自动备份');
      return false;
    }
    
    // 获取最新的备份
    const latestBackupKey = backupKeys.sort().reverse()[0];
    const backupData = localStorage.getItem(latestBackupKey);
    
    if (!backupData) return false;
    
    try {
      const data = JSON.parse(backupData);
      
      // 确认恢复
      const confirm = window.confirm('确定要恢复到最近的自动备份吗？当前数据会被覆盖。');
      if (!confirm) return false;
      
      // 清空当前数据（保留备份）
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('auto-backup-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 恢复数据
      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith('auto-backup-')) {
          try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          } catch (error) {
            console.error(`Failed to restore key: ${key}`, error);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }
}
