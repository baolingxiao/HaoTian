// AudioPlayer 组件 - 音频播放器 UI
// Why: 可视化显示 TTS 生成的音频播放状态
// How: 使用 useVoice Hook + 进度条动画

"use client";

import { useEffect, useState } from "react";
import type { UseVoiceReturn } from "@/types/voice";

interface AudioPlayerProps {
  voice: UseVoiceReturn;
}

export default function AudioPlayer({ voice }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);

  // 模拟播放进度（实际项目可接入 audio.currentTime）
  useEffect(() => {
    if (voice.isSpeaking) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [voice.isSpeaking]);

  if (!voice.isSpeaking && !voice.audioUrl) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        {/* 播放/停止按钮 */}
        <button
          onClick={voice.isSpeaking ? voice.stopSpeaking : undefined}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            voice.isSpeaking
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-300"
          }`}
        >
          {voice.isSpeaking ? (
            // 停止图标
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            // 播放图标
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* 进度条 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-purple-700">
              {voice.isSpeaking ? "正在播放..." : "播放完成"}
            </span>
            {voice.isSpeaking && (
              <span className="text-xs text-purple-600">{progress}%</span>
            )}
          </div>

          {/* 进度条 */}
          <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 波形动画 */}
          {voice.isSpeaking && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 音量图标 */}
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </div>
      </div>

      {/* 音频源信息 */}
      {voice.audioUrl && !voice.isSpeaking && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <a
            href={voice.audioUrl}
            download="voice.mp3"
            className="text-xs text-purple-600 hover:text-purple-800 underline"
          >
            下载音频文件
          </a>
        </div>
      )}
    </div>
  );
}

