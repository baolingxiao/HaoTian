// useMemory Hook - 本地记忆系统管理
// Why: 提供简单的 API 来读写用户数据、聊天记录和摘要
// How: 封装 DuckDB 客户端，自动初始化和错误处理

"use client";

import { useState, useEffect, useCallback } from "react";
import { duckDBClient } from "@/lib/memory/duckdb-client";
import type {
  UserProfile,
  ChatSummary,
  ChatMessage,
  UserPreferences,
  MemoryStats,
  UseMemoryReturn,
} from "@/types/memory";

const DEFAULT_USER_ID = "default-user";

export function useMemory(): UseMemoryReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MemoryStats | null>(null);

  // 初始化数据库
  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true);
        await duckDBClient.init();
        
        // 确保默认用户存在
        const profile = await getProfileInternal();
        if (!profile) {
          await createDefaultProfile();
        }
        
        // 更新统计
        await updateStats();
        
        setIsReady(true);
        setError(null);
      } catch (err: any) {
        console.error("[useMemory] Init failed:", err);
        setError(err.message || "Failed to initialize database");
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  // 内部方法：获取用户配置
  const getProfileInternal = async (): Promise<UserProfile | null> => {
    const results = await duckDBClient.query<UserProfile>(
      `SELECT * FROM user_profiles WHERE id = '${DEFAULT_USER_ID}'`
    );
    return results[0] || null;
  };

  // 内部方法：创建默认用户
  const createDefaultProfile = async (): Promise<void> => {
    await duckDBClient.insert("user_profiles", {
      id: DEFAULT_USER_ID,
      name: "User",
      mbti: null,
      preferences: JSON.stringify({}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  // 更新统计信息
  const updateStats = async (): Promise<void> => {
    try {
      const dbStats = await duckDBClient.getStats();
      
      setStats({
        totalChats: dbStats.summaries,
        totalMessages: dbStats.messages,
        totalSummaries: dbStats.summaries,
        databaseSize: 0, // DuckDB WASM 不提供大小信息
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("[useMemory] Failed to update stats:", err);
    }
  };

  /**
   * 获取用户配置
   */
  const getProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      return await getProfileInternal();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * 更新用户配置
   */
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<void> => {
    try {
      await duckDBClient.update(
        "user_profiles",
        {
          ...data,
          updated_at: new Date().toISOString(),
        },
        `id = '${DEFAULT_USER_ID}'`
      );
      
      console.log("[useMemory] Profile updated");
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 设置 MBTI
   */
  const setMBTI = useCallback(async (mbti: string): Promise<void> => {
    await updateProfile({ mbti });
  }, [updateProfile]);

  /**
   * 设置用户名
   */
  const setName = useCallback(async (name: string): Promise<void> => {
    await updateProfile({ name });
  }, [updateProfile]);

  /**
   * 更新偏好设置
   */
  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>): Promise<void> => {
      try {
        const profile = await getProfileInternal();
        const currentPrefs = profile?.preferences || {};
        const newPrefs = { ...currentPrefs, ...prefs };
        
        await updateProfile({ preferences: newPrefs as any });
        console.log("[useMemory] Preferences updated");
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [updateProfile]
  );

  /**
   * 创建新对话
   */
  const createChat = useCallback(async (title?: string): Promise<string> => {
    try {
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await duckDBClient.insert("chat_summaries", {
        id: chatId,
        user_id: DEFAULT_USER_ID,
        title: title || `Chat ${new Date().toLocaleString()}`,
        summary: "",
        key_points: JSON.stringify([]),
        emotions: JSON.stringify([]),
        message_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await updateStats();
      return chatId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 获取对话摘要
   */
  const getChat = useCallback(async (chatId: string): Promise<ChatSummary | null> => {
    try {
      const results = await duckDBClient.query<ChatSummary>(
        `SELECT * FROM chat_summaries WHERE id = '${chatId}'`
      );
      return results[0] || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * 列出所有对话
   */
  const listChats = useCallback(async (limit: number = 50): Promise<ChatSummary[]> => {
    try {
      const results = await duckDBClient.query<ChatSummary>(
        `SELECT * FROM chat_summaries 
         WHERE user_id = '${DEFAULT_USER_ID}' 
         ORDER BY updated_at DESC 
         LIMIT ${limit}`
      );
      return results;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  /**
   * 删除对话
   */
  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    try {
      await duckDBClient.delete("chat_messages", `chat_id = '${chatId}'`);
      await duckDBClient.delete("chat_summaries", `id = '${chatId}'`);
      await updateStats();
      console.log("[useMemory] Chat deleted:", chatId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 保存消息
   */
  const saveMessage = useCallback(
    async (message: Omit<ChatMessage, "id" | "createdAt">): Promise<void> => {
      try {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await duckDBClient.insert("chat_messages", {
          id: messageId,
          chat_id: message.chatId,
          role: message.role,
          content: message.content,
          emotion: message.emotion || null,
          metadata: JSON.stringify(message.metadata || {}),
          created_at: new Date().toISOString(),
        });

        // 更新对话的消息计数
        await duckDBClient.execute(`
          UPDATE chat_summaries 
          SET message_count = message_count + 1,
              updated_at = '${new Date().toISOString()}'
          WHERE id = '${message.chatId}'
        `);

        await updateStats();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  /**
   * 获取对话消息
   */
  const getChatMessages = useCallback(
    async (chatId: string, limit: number = 100): Promise<ChatMessage[]> => {
      try {
        const results = await duckDBClient.query<ChatMessage>(
          `SELECT * FROM chat_messages 
           WHERE chat_id = '${chatId}' 
           ORDER BY created_at ASC 
           LIMIT ${limit}`
        );
        return results;
      } catch (err: any) {
        setError(err.message);
        return [];
      }
    },
    []
  );

  /**
   * 生成对话摘要
   */
  const generateSummary = useCallback(async (chatId: string): Promise<void> => {
    try {
      // 获取最近的消息
      const messages = await getChatMessages(chatId, 50);
      
      if (messages.length === 0) {
        return;
      }

      // 简单的摘要生成（生产环境应该调用 LLM）
      const userMessages = messages.filter((m) => m.role === "user");
      const keyPoints = userMessages
        .slice(-5)
        .map((m) => m.content.substring(0, 50) + "...");

      const emotions = messages
        .filter((m) => m.emotion)
        .map((m) => m.emotion)
        .filter((e, i, arr) => arr.indexOf(e) === i) as string[];

      await duckDBClient.update(
        "chat_summaries",
        {
          summary: `包含 ${messages.length} 条消息的对话`,
          key_points: JSON.stringify(keyPoints),
          emotions: JSON.stringify(emotions),
          updated_at: new Date().toISOString(),
        },
        `id = '${chatId}'`
      );

      console.log("[useMemory] Summary generated for:", chatId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [getChatMessages]);

  /**
   * 获取摘要
   */
  const getSummary = useCallback(async (chatId: string): Promise<ChatSummary | null> => {
    return await getChat(chatId);
  }, [getChat]);

  /**
   * 清空所有数据
   */
  const clear = useCallback(async (): Promise<void> => {
    try {
      await duckDBClient.clearAll();
      await createDefaultProfile();
      await updateStats();
      console.log("[useMemory] All data cleared");
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 导出数据
   */
  const exportData = useCallback(async (): Promise<Blob> => {
    try {
      return await duckDBClient.exportData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 导入数据
   */
  const importData = useCallback(async (data: Blob): Promise<void> => {
    try {
      await duckDBClient.importData(data);
      await updateStats();
      console.log("[useMemory] Data imported");
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * 获取统计信息
   */
  const getStats = useCallback(async (): Promise<MemoryStats> => {
    await updateStats();
    return stats || {
      totalChats: 0,
      totalMessages: 0,
      totalSummaries: 0,
      databaseSize: 0,
      lastUpdated: new Date(),
    };
  }, [stats]);

  return {
    // 状态
    isReady,
    isLoading,
    error,
    stats,

    // 用户管理
    getProfile,
    updateProfile,
    setMBTI,
    setName,
    updatePreferences,

    // 聊天管理
    createChat,
    getChat,
    listChats,
    deleteChat,

    // 消息管理
    saveMessage,
    getChatMessages,

    // 摘要管理
    generateSummary,
    getSummary,

    // 工具方法
    clear,
    export: exportData,
    import: importData,
    getStats,
  };
}



