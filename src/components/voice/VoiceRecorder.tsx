// VoiceRecorder 组件 - 语音录制 UI
// Why: 提供用户友好的录音界面，显示录音状态和波形动画
// How: 使用 useVoice Hook + Tailwind CSS

"use client";

import { useEffect, useState } from "react";
import type { UseVoiceReturn } from "@/types/voice";

interface VoiceRecorderProps {
  voice: UseVoiceReturn;
  onTranscriptionComplete?: (text: string) => void;
}

export default function VoiceRecorder({
  voice,
  onTranscriptionComplete,
}: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0);

  // 录音计时器
  useEffect(() => {
    if (voice.isRecording) {
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDuration(0);
    }
  }, [voice.isRecording]);

  // 转写完成回调
  useEffect(() => {
    if (voice.transcription && onTranscriptionComplete) {
      onTranscriptionComplete(voice.transcription);
    }
  }, [voice.transcription, onTranscriptionComplete]);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 渲染状态提示
  const getStatusText = () => {
    switch (voice.status) {
      case "recording":
        return "正在录音...";
      case "processing":
        return "转写中...";
      case "speaking":
        return "播放中...";
      case "error":
        return "出错了";
      default:
        return "点击开始录音";
    }
  };

  // 渲染状态图标
  const getStatusIcon = () => {
    switch (voice.status) {
      case "recording":
        return (
          <div className="relative">
            {/* 录音脉冲动画 */}
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </div>
        );
      case "processing":
        return (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border rounded-lg shadow-sm">
      {/* 状态图标 */}
      <div
        onClick={() => {
          if (voice.status === "idle") {
            voice.startRecording();
          } else if (voice.isRecording) {
            voice.stopRecording();
          }
        }}
        className={voice.status === "idle" ? "cursor-pointer" : ""}
      >
        {getStatusIcon()}
      </div>

      {/* 状态文本 */}
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">{getStatusText()}</p>
        {voice.isRecording && (
          <p className="text-sm text-gray-500 mt-1">{formatDuration(duration)}</p>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3">
        {voice.isRecording && (
          <>
            <button
              onClick={voice.stopRecording}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              完成录音
            </button>
            <button
              onClick={voice.cancelRecording}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </>
        )}
      </div>

      {/* 错误提示 */}
      {voice.error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>错误:</strong> {voice.error.message}
          </p>
          {voice.error.code === "PERMISSION_DENIED" && (
            <p className="text-xs text-red-600 mt-1">
              请在浏览器设置中允许访问麦克风
            </p>
          )}
        </div>
      )}

      {/* 转写结果 */}
      {voice.transcription && (
        <div className="w-full p-4 bg-gray-50 border rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">识别结果:</p>
          <p className="text-base text-gray-900">{voice.transcription}</p>
        </div>
      )}
    </div>
  );
}

