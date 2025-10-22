import { ChatMessage } from "@/types/chat";

// 简单策略：仅保留最后 N 条 + 可选摘要（此处先占位）
export function truncate(messages: ChatMessage[], max = 10) {
  const tail = messages.slice(-max);
  return tail;
}



