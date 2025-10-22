"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    // 自动跳转到 Avatar 聊天页面
    router.push("/avatar-chat");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">正在跳转到 Avatar 聊天...</p>
      </div>
    </main>
  );
}

