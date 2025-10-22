"use client";
import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import Composer from "./Composer";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function send(input: string) {
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setLoading(true);

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      const resp = await fetch("/api/chat-fixed", {
        method: "POST",
        signal: controllerRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "local-chat",            // 真实项目中使用数据库生成的 chatId
          messages: next,
          tone: "friendly",
        }),
      });

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages(m => [...m, { role: "assistant" as const, content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // 解析 SSE：data: xxx
        chunk.split("\n\n").forEach(line => {
          if (line.startsWith("data: ")) {
            const delta = line.slice(6);
            acc += delta;
            setMessages(m => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant" as const, content: acc };
              return copy;
            });
          }
        });
      }
    } catch (e) {
      alert("请求失败，可重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <MessageList items={messages} loading={loading} />
      <Composer onSend={send} disabled={loading} onStop={() => controllerRef.current?.abort()} />
    </div>
  );
}
