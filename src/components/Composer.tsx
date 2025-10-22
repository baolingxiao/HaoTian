"use client";
import { useState } from "react";

export default function Composer({
  onSend,
  onStop,
  disabled,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(text); setText(""); } }}
        placeholder="输入内容，回车发送"
        className="flex-1 border rounded px-3 py-2"
        disabled={disabled}
      />
      <button
        className="px-3 py-2 border rounded"
        onClick={() => { onSend(text); setText(""); }}
        disabled={disabled}
      >
        发送
      </button>
      <button className="px-3 py-2 border rounded" onClick={onStop} disabled={!disabled}>
        停止
      </button>
    </div>
  );
}



