"use client";
import { useState } from "react";

export default function FeedbackBar({
  messageId,
  onFeedback,
}: {
  messageId?: string;
  onFeedback?: (useful: boolean, note?: string) => void;
}) {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (useful: boolean) => {
    onFeedback?.(useful, note);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-sm text-gray-500 text-center py-2">
        感谢您的反馈！
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-sm text-gray-600">这个回答对您有帮助吗？</span>
      <button
        onClick={() => handleFeedback(true)}
        className="px-2 py-1 text-sm border rounded hover:bg-green-50"
      >
        👍
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className="px-2 py-1 text-sm border rounded hover:bg-red-50"
      >
        👎
      </button>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="可选：告诉我们如何改进"
        className="flex-1 text-sm border rounded px-2 py-1"
      />
    </div>
  );
}



