// 记忆系统类型定义
// Why: 统一管理本地数据库的数据结构
// How: 定义 MBTI 配置、用户信息、聊天摘要等

export interface UserProfile {
  id: string;
  name: string;
  mbti: string | null;           // MBTI 类型（如 "ENFP"）
  preferences: Record<string, any>; // JSON 偏好设置
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSummary {
  id: string;
  userId: string;
  title: string;                  // 对话标题（自动生成或手动设置）
  summary: string;                // 对话摘要
  keyPoints: string[];            // 关键要点
  emotions: string[];             // 主要情绪
  messageCount: number;           // 消息数量
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  emotion?: string;               // 情绪标签
  metadata: Record<string, any>;  // 额外元数据
  createdAt: Date;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "auto";
  language?: string;
  avatarModel?: string;
  ttsVoice?: string;
  autoSaveEnabled?: boolean;
  summaryFrequency?: number;      // 每 N 条消息生成摘要
  [key: string]: any;             // 允许自定义字段
}

export interface MemoryStats {
  totalChats: number;
  totalMessages: number;
  totalSummaries: number;
  databaseSize: number;           // 字节
  lastUpdated: Date;
}

// Hook 返回类型
export interface UseMemoryReturn {
  // 状态
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  stats: MemoryStats | null;

  // 用户管理
  getProfile: () => Promise<UserProfile | null>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setMBTI: (mbti: string) => Promise<void>;
  setName: (name: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;

  // 聊天管理
  createChat: (title?: string) => Promise<string>;
  getChat: (chatId: string) => Promise<ChatSummary | null>;
  listChats: (limit?: number) => Promise<ChatSummary[]>;
  deleteChat: (chatId: string) => Promise<void>;

  // 消息管理
  saveMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => Promise<void>;
  getChatMessages: (chatId: string, limit?: number) => Promise<ChatMessage[]>;
  
  // 摘要管理
  generateSummary: (chatId: string) => Promise<void>;
  getSummary: (chatId: string) => Promise<ChatSummary | null>;

  // 工具方法
  clear: () => Promise<void>;
  export: () => Promise<Blob>;
  import: (data: Blob) => Promise<void>;
  getStats: () => Promise<MemoryStats>;
}



