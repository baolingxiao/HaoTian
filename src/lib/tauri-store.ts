/**
 * Tauri 本地存储工具
 * 用于桌面应用的数据持久化（替代浏览器的 localStorage/IndexedDB）
 * 
 * 为什么需要：
 * - Tauri 应用中，可以使用原生文件系统存储
 * - 提供更好的性能和更大的存储空间
 * - 支持加密和安全存储
 */

import { Store } from '@tauri-apps/plugin-store';

// 检测是否在 Tauri 环境中
export function isTauriEnv(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}

// 创建存储实例
let storeInstance: Store | null = null;

/**
 * 获取 Tauri Store 实例
 * 在浏览器环境中返回 null，使用 localStorage 降级
 */
export async function getTauriStore(): Promise<Store | null> {
  if (!isTauriEnv()) return null;
  
  if (!storeInstance) {
    storeInstance = await Store.load('chatpot.dat');
  }
  
  return storeInstance;
}

/**
 * 统一的存储接口（自动降级到 localStorage）
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (isTauriEnv()) {
      const store = await getTauriStore();
      if (store) {
        return (await store.get<T>(key)) ?? null;
      }
    }
    
    // 浏览器降级
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    
    return null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (isTauriEnv()) {
      const store = await getTauriStore();
      if (store) {
        await store.set(key, value);
        await store.save();
        return;
      }
    }
    
    // 浏览器降级
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async remove(key: string): Promise<void> {
    if (isTauriEnv()) {
      const store = await getTauriStore();
      if (store) {
        await store.delete(key);
        await store.save();
        return;
      }
    }
    
    // 浏览器降级
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    if (isTauriEnv()) {
      const store = await getTauriStore();
      if (store) {
        await store.clear();
        await store.save();
        return;
      }
    }
    
    // 浏览器降级
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },

  async keys(): Promise<string[]> {
    if (isTauriEnv()) {
      const store = await getTauriStore();
      if (store) {
        return await store.keys();
      }
    }
    
    // 浏览器降级
    if (typeof window !== 'undefined') {
      return Object.keys(localStorage);
    }
    
    return [];
  },
};

/**
 * 文件系统操作（仅 Tauri）
 */
export const fileSystem = {
  async readText(path: string): Promise<string | null> {
    if (!isTauriEnv()) return null;
    
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      return await readTextFile(path);
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  },

  async writeText(path: string, content: string): Promise<boolean> {
    if (!isTauriEnv()) return false;
    
    try {
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      await writeTextFile(path, content);
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  },

  async exists(path: string): Promise<boolean> {
    if (!isTauriEnv()) return false;
    
    try {
      const { exists } = await import('@tauri-apps/plugin-fs');
      return await exists(path);
    } catch (error) {
      console.error('Failed to check file existence:', error);
      return false;
    }
  },

  async remove(path: string): Promise<boolean> {
    if (!isTauriEnv()) return false;
    
    try {
      const { remove } = await import('@tauri-apps/plugin-fs');
      await remove(path);
      return true;
    } catch (error) {
      console.error('Failed to remove file:', error);
      return false;
    }
  },
};



