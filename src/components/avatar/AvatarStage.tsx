// AvatarStage 组件 - Live2D Avatar 展示舞台
// Why: 提供一个独立的 Avatar 显示容器，可嵌入任何页面
// How: 使用 useAvatar Hook + Canvas 渲染

"use client";

import { useEffect, useRef } from "react";
import { useAvatar } from "@/hooks/useAvatar";
import type { AvatarConfig } from "@/types/avatar";

export interface AvatarStageProps {
  config?: Partial<AvatarConfig>;
  width?: number | string;
  height?: number | string;
  className?: string;
  onLoaded?: () => void;
  onError?: (error: string) => void;
}

export default function AvatarStage({
  config,
  width = "100%",
  height = "600px",
  className = "",
  onLoaded,
  onError,
}: AvatarStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatar = useAvatar(config);

  // 初始化 Avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 延迟初始化，确保 DOM 完全准备好
    const timer = setTimeout(async () => {
      try {
        await avatar.init(canvas);
        onLoaded?.();
      } catch (error: any) {
        console.error("[AvatarStage] Failed to initialize:", error);
        onError?.(error.message);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [avatar, onLoaded, onError]);

  // 监听状态变化
  useEffect(() => {
    if (avatar.state.error && onError) {
      onError(avatar.state.error);
    }
  }, [avatar.state.error, onError]);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-purple-50 to-pink-50 rounded-lg ${className}`}
      style={{ width, height }}
    >
      {/* Canvas 容器 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: avatar.state.isLoaded ? "block" : "none",
        }}
      />

      {/* 加载状态 */}
      {!avatar.state.isLoaded && !avatar.state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-600">Loading Avatar...</p>
        </div>
      )}

      {/* 错误状态 */}
      {avatar.state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-sm text-red-600 text-center mb-4">
            {avatar.state.error}
          </p>
          <div className="text-xs text-gray-500 text-center max-w-md">
            <p>请确保 Live2D 模型文件已正确放置在 <code className="bg-gray-100 px-1">public/models/live2d/</code> 目录</p>
          </div>
        </div>
      )}

      {/* 状态指示器（开发模式） */}
      {process.env.NODE_ENV === "development" && avatar.state.isLoaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
          <div>Emotion: {avatar.state.currentEmotion}</div>
          <div>Expression: {avatar.state.currentExpression}</div>
          {avatar.state.isSpeaking && <div className="text-green-400">● Speaking</div>}
        </div>
      )}

      {/* 底部操作栏（可选） */}
      {avatar.state.isLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-4">
          <div className="flex items-center justify-center gap-2">
            {/* 表情快捷按钮 */}
            <button
              onClick={() => avatar.setExpression("smile")}
              className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-full transition-colors"
              title="微笑"
            >
              😊
            </button>
            <button
              onClick={() => avatar.setExpression("surprised")}
              className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-full transition-colors"
              title="惊讶"
            >
              😮
            </button>
            <button
              onClick={() => avatar.setExpression("sad")}
              className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-full transition-colors"
              title="难过"
            >
              😢
            </button>
            <button
              onClick={() => avatar.setExpression("angry")}
              className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-full transition-colors"
              title="生气"
            >
              😠
            </button>
            <button
              onClick={() => avatar.setExpression("default")}
              className="px-3 py-1 bg-white/80 hover:bg-white text-sm rounded-full transition-colors"
              title="默认"
            >
              😐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AvatarStage 的轻量级变体（仅显示，无控制）
 */
export function AvatarStageMinimal({
  config,
  width = "300px",
  height = "400px",
  className = "",
}: Omit<AvatarStageProps, "onLoaded" | "onError">) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatar = useAvatar(config);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timer = setTimeout(async () => {
      try {
        await avatar.init(canvas);
      } catch (error) {
        console.error("[AvatarStageMinimal] Init failed:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [avatar]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {!avatar.state.isLoaded && !avatar.state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}



