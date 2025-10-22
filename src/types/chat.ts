export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  id?: string;
  role: Role;
  content: string;
  tokens?: number;
}

export interface ChatRequestBody {
  chatId: string;
  messages: ChatMessage[];   // 最近若干条（前端已做截断）
  tone?: "formal" | "friendly";
}



