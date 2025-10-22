// 语音聊天演示页面
// Why: 展示完整的语音交互流程：录音 → STT → LLM → TTS → 播放
// How: 整合 useVoice Hook + VoiceRecorder + AudioPlayer + Chat API

"use client";

import { useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import AudioPlayer from "@/components/voice/AudioPlayer";

export default function VoiceChatPage() {
  const voice = useVoice({
    sttProvider: "whisper",
    ttsProvider: "openai",
    voice: "alloy",
    language: "zh",
  });

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 处理转写完成
  const handleTranscriptionComplete = async (text: string) => {
    if (!text.trim()) return;

    // 添加用户消息
    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);

    // 调用 LLM API
    setIsGenerating(true);
    try {
      const response = await fetch("/api/chat-fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "voice-chat",
          messages: [...messages, userMessage],
          tone: "friendly",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // 解析流式响应
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        chunk.split("\n\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            const delta = line.slice(6);
            if (delta !== "[DONE]") {
              assistantText += delta;
            }
          }
        });
      }

      // 添加助手回复
      const assistantMessage = {
        role: "assistant" as const,
        content: assistantText,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 转为语音播放
      await voice.speak(assistantText);
    } catch (error) {
      console.error("Failed to get LLM response:", error);
      alert("获取回复失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  // 重置对话
  const resetConversation = () => {
    setMessages([]);
    voice.stopSpeaking();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 语音聊天演示
          </h1>
          <p className="text-gray-600">
            录音 → 语音转文字 → AI 回复 → 文字转语音 → 播放
          </p>
        </div>

        {/* 配置面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* STT Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语音识别
              </label>
              <select
                value={voice.config.sttProvider}
                onChange={(e) =>
                  voice.updateConfig({
                    sttProvider: e.target.value as "whisper" | "local",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whisper">OpenAI Whisper</option>
                <option value="local">本地模型</option>
              </select>
            </div>

            {/* TTS Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语音合成
              </label>
              <select
                value={voice.config.ttsProvider}
                onChange={(e) =>
                  voice.updateConfig({
                    ttsProvider: e.target.value as "openai" | "elevenlabs",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI TTS</option>
                <option value="elevenlabs">ElevenLabs</option>
              </select>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语音
              </label>
              {voice.config.ttsProvider === "openai" ? (
                <select
                  value={voice.config.voice}
                  onChange={(e) => voice.updateConfig({ voice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={voice.config.voice}
                  onChange={(e) => voice.updateConfig({ voice: e.target.value })}
                  placeholder="Voice ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* 语音录制 */}
        <div className="mb-6">
          <VoiceRecorder
            voice={voice}
            onTranscriptionComplete={handleTranscriptionComplete}
          />
        </div>

        {/* 音频播放器 */}
        {(voice.isSpeaking || voice.audioUrl) && (
          <div className="mb-6">
            <AudioPlayer voice={voice} />
          </div>
        )}

        {/* 对话历史 */}
        {messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                💬 对话记录
              </h2>
              <button
                onClick={resetConversation}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空对话
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {msg.role === "user" ? "你" : "AI 助手"}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                      <span className="text-sm text-gray-600 ml-2">
                        AI 正在思考...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 使用说明
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>点击麦克风图标开始录音</li>
            <li>说话后点击"完成录音"按钮</li>
            <li>系统会自动将语音转为文字</li>
            <li>AI 会生成回复并自动播放语音</li>
            <li>可以随时切换语音识别和合成的提供商</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

