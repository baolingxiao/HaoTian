// useVoice Hook - 管理语音交互的核心逻辑
// Why: 封装录音、转写、TTS、播放的完整流程，提供简单的 API
// How: 使用 MediaRecorder API 录音，调用后端 API 进行 STT/TTS

"use client";

import { useState, useRef, useCallback } from "react";
import type {
  VoiceStatus,
  VoiceConfig,
  VoiceError,
  UseVoiceReturn,
  TranscriptionResult,
} from "@/types/voice";

const DEFAULT_CONFIG: VoiceConfig = {
  sttProvider: "whisper",
  ttsProvider: "openai",
  voice: "alloy",
  language: "zh",
  sampleRate: 16000,
  encoding: "mp3",
};

export function useVoice(initialConfig?: Partial<VoiceConfig>): UseVoiceReturn {
  // 状态管理
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<VoiceError | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<VoiceConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  // Refs - 存储不需要触发重渲染的数据
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 清理错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      clearError();
      setStatus("recording");

      // 请求麦克风权限
      // Why: 需要用户明确授权才能访问麦克风
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // 单声道
          sampleRate: config.sampleRate,
          echoCancellation: true, // 回声消除
          noiseSuppression: true, // 噪音抑制
        },
      });

      streamRef.current = stream;

      // 创建 MediaRecorder
      // Why: 浏览器原生 API，支持录音并导出为 Blob
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm", // 浏览器通用格式
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 收集音频数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 录音结束时处理
      mediaRecorder.onstop = async () => {
        setStatus("processing");

        try {
          // 合并音频片段为单个 Blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          console.log("[useVoice] Recording stopped, size:", audioBlob.size);

          // 调用 STT API
          await transcribeAudio(audioBlob);
        } catch (err: any) {
          console.error("[useVoice] Transcription failed:", err);
          setError({
            code: "API_ERROR",
            message: "Failed to transcribe audio",
            details: err,
          });
          setStatus("error");
        }
      };

      // 开始录音
      mediaRecorder.start(100); // 每 100ms 触发一次 dataavailable
      console.log("[useVoice] Recording started");
    } catch (err: any) {
      console.error("[useVoice] Failed to start recording:", err);

      // 处理常见错误
      let errorCode: VoiceError["code"] = "UNKNOWN";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorCode = "PERMISSION_DENIED";
      } else if (err.name === "NotFoundError") {
        errorCode = "NO_MICROPHONE";
      }

      setError({
        code: errorCode,
        message: err.message || "Failed to access microphone",
        details: err,
      });
      setStatus("error");
    }
  }, [config.sampleRate, clearError]);

  // 停止录音
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("[useVoice] Stopping recording...");
      mediaRecorderRef.current.stop();

      // 停止所有音轨
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  // 取消录音
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      audioChunksRef.current = [];
      setStatus("idle");
      setTranscription("");
    }
  }, []);

  // 转写音频
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      if (config.language) {
        formData.append("language", config.language);
      }

      // 调用 STT API
      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "STT API failed");
      }

      const result: TranscriptionResult = await response.json();
      console.log("[useVoice] Transcription result:", result.text);

      setTranscription(result.text);
      setStatus("idle");
    } catch (err: any) {
      console.error("[useVoice] Transcription error:", err);
      throw err;
    }
  };

  // 文字转语音并播放
  const speak = useCallback(
    async (text: string) => {
      try {
        clearError();
        setStatus("speaking");

        console.log("[useVoice] Generating speech for:", text);

        // 调用 TTS API
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: config.voice,
            provider: config.ttsProvider,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "TTS API failed");
        }

        // 获取音频 Blob
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // 播放音频
        // Why: 使用 Audio 元素播放，支持自动播放和事件监听
        const audio = new Audio(url);
        audioElementRef.current = audio;

        audio.onended = () => {
          console.log("[useVoice] Playback finished");
          setStatus("idle");
        };

        audio.onerror = (err) => {
          console.error("[useVoice] Playback error:", err);
          setError({
            code: "UNKNOWN",
            message: "Failed to play audio",
            details: err,
          });
          setStatus("error");
        };

        await audio.play();
        console.log("[useVoice] Playing audio");
      } catch (err: any) {
        console.error("[useVoice] TTS error:", err);
        setError({
          code: "API_ERROR",
          message: "Failed to generate speech",
          details: err,
        });
        setStatus("error");
      }
    },
    [config.voice, config.ttsProvider, clearError]
  );

  // 停止播放
  const stopSpeaking = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setStatus("idle");
    }
  }, []);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // 返回 Hook API
  return {
    // 状态
    status,
    isRecording: status === "recording",
    isSpeaking: status === "speaking",
    error,

    // 数据
    transcription,
    audioUrl,

    // 方法
    startRecording,
    stopRecording,
    cancelRecording,
    speak,
    stopSpeaking,

    // 配置
    config,
    updateConfig,
  };
}

