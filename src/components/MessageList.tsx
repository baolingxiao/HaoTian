"use client";
import TypingDots from "./TypingDots";

export default function MessageList({
  items,
  loading,
}: {
  items: { role: "user" | "assistant"; content: string }[];
  loading: boolean;
}) {
  return (
    <div className="min-h-[320px] border rounded-lg p-3 space-y-3">
      {items.map((m, i) => (
        <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
          <div className={`inline-block rounded px-3 py-2 ${m.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
            {m.content || <TypingDots />}
          </div>
        </div>
      ))}
      {loading && items[items.length - 1]?.role === "user" && (
        <div className="text-left">
          <div className="inline-block rounded px-3 py-2 bg-gray-100">
            <TypingDots />
          </div>
        </div>
      )}
    </div>
  );
}



