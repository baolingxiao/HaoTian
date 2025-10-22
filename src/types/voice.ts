// 语音相关的 TypeScript 类型定义
// Why: 统一管理语音系统的所有类型，确保类型安全

export type VoiceStatus = "idle" | "recording" | "processing" | "speaking" | "error";

export interface VoiceConfig {
  // STT 配置
  sttProvider: "whisper" | "local";
  language?: string;
  
  // TTS 配置
  ttsProvider: "elevenlabs" | "openai";
  voice?: string; // ElevenLabs voice ID 或 OpenAI voice name
  
  // 音频配置
  sampleRate?: number;
  encoding?: "mp3" | "opus" | "pcm16";
}

export interface RecordingState {
  isRecording: boolean;
  duration: number; // 录音时长（秒）
  audioBlob: Blob | null;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
}

export interface TTSResult {
  audioUrl: string; // 音频文件 URL 或 data URI
  duration?: number;
}

export interface VoiceError {
  code: "PERMISSION_DENIED" | "NO_MICROPHONE" | "NETWORK_ERROR" | "API_ERROR" | "UNKNOWN";
  message: string;
  details?: any;
}

// useVoice Hook 返回类型
export interface UseVoiceReturn {
  // 状态
  status: VoiceStatus;
  isRecording: boolean;
  isSpeaking: boolean;
  error: VoiceError | null;
  
  // 数据
  transcription: string;
  audioUrl: string | null;
  
  // 方法
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  
  // 配置
  config: VoiceConfig;
  updateConfig: (config: Partial<VoiceConfig>) => void;
}

