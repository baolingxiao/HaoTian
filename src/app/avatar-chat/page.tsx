// Avatar Chat 演示页面
// Why: 展示完整的 Avatar + 聊天集成，情绪自动同步
// How: 整合 AvatarStage + Chat 组件 + 情绪分析

"use client";

import { useState, useRef, useEffect } from "react";
import { useAvatar } from "@/hooks/useAvatar";

export default function AvatarChatPage() {
  const avatar = useAvatar({
    // 使用 CDN Cubism 4.x 模型 (Senko)
    modelPath: "https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json",
    scale: 0.15,  // 稍微放大一点
    x: 0,        // 水平居中
    y: -50,      // 垂直居中（负值向上移动）
  });

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初始化 Avatar（只在组件挂载时执行一次）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isInitialized = false;

    const initAvatar = async () => {
      // 防止重复初始化
      if (isInitialized) {
        console.log("[AvatarChat] Avatar already initialized, skipping...");
        return;
      }

      try {
        console.log("[AvatarChat] Waiting for Cubism 4 SDK to be ready...");
        
        // 等待 Cubism 4 SDK 完全加载（Live2DCubismCore）
        let retries = 0;
        const maxRetries = 50; // 最多等待 5 秒
        while (typeof (window as any).Live2DCubismCore === 'undefined' && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (typeof (window as any).Live2DCubismCore === 'undefined') {
          throw new Error("Cubism 4 SDK (Live2DCubismCore) not loaded after 5 seconds");
        }
        
        console.log("[AvatarChat] Cubism 4 SDK ready, initializing avatar...");
        await avatar.init(canvas);
        isInitialized = true;
        console.log("[AvatarChat] Avatar loaded successfully!");
      } catch (error: any) {
        console.error("[AvatarChat] Avatar error:", error);
      }
    };

    // 延迟初始化，确保 DOM 完全准备好
    const timer = setTimeout(initAvatar, 300);
    return () => {
      clearTimeout(timer);
      // 清理时标记为未初始化
      isInitialized = false;
    };
  }, []); // 空依赖数组 - 只在挂载时执行一次

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage = { role: "user" as const, content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Avatar 表现：用户发言时显示思考表情
    avatar.setEmotion("thinking");

    setIsGenerating(true);

    try {
      // 调用 LLM API
      const response = await fetch("/api/chat-fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "avatar-chat",
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

      // Avatar 开始说话
      avatar.speak(true);

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

      // Avatar 停止说话
      avatar.speak(false);

      // 添加助手回复
      const assistantMessage = {
        role: "assistant" as const,
        content: assistantText,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 分析情绪并应用到 Avatar
      avatar.analyzeText(assistantText);
    } catch (error) {
      console.error("Failed to get response:", error);
      alert("获取回复失败，请重试");
      avatar.setEmotion("sad");
      avatar.speak(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎭 Avatar Chat 演示
          </h1>
          <p className="text-gray-600">
            AI 会根据回复内容自动切换表情和情绪
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：Avatar 展示 */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🧸 Live2D Avatar
              </h2>
              
              <div className="relative w-full h-[500px] bg-gradient-to-b from-purple-50 to-pink-50 rounded-lg overflow-hidden">
                {/* Canvas for Live2D */}
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ display: avatar.state.isLoaded ? 'block' : 'none' }}
                />
                
                {/* Loading State */}
                {!avatar.state.isLoaded && !avatar.state.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                    <p className="mt-4 text-sm text-gray-600">加载中...</p>
                    <p className="mt-2 text-xs text-gray-500">正在从 CDN 加载模型</p>
                  </div>
                )}
                
                {/* Error State */}
                {avatar.state.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="text-6xl mb-4">😢</div>
                    <p className="text-sm text-red-600 text-center mb-4">
                      {avatar.state.error}
                    </p>
                    <div className="text-xs text-gray-500 text-center max-w-md space-y-2">
                      <p>加载失败，可能的原因：</p>
                      <p>1. 网络连接问题（CDN 无法访问）</p>
                      <p>2. 模型文件路径错误</p>
                      <p>3. 浏览器控制台查看详细错误</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 情绪状态面板 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                当前状态
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-gray-600 mb-1">情绪</div>
                  <div className="font-semibold text-purple-700">
                    {avatar.state.currentEmotion}
                  </div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <div className="text-gray-600 mb-1">表情</div>
                  <div className="font-semibold text-pink-700">
                    {avatar.state.currentExpression}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-gray-600 mb-1">状态</div>
                  <div className="font-semibold text-blue-700">
                    {avatar.state.isSpeaking ? "说话中" : "空闲"}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-gray-600 mb-1">加载</div>
                  <div className="font-semibold text-green-700">
                    {avatar.state.isLoaded ? "已加载" : "加载中"}
                  </div>
                </div>
              </div>
            </div>

            {/* 手动控制面板 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                手动控制
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => avatar.setEmotion("happy")}
                  className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm rounded-lg transition-colors"
                >
                  😊 开心
                </button>
                <button
                  onClick={() => avatar.setEmotion("sad")}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-lg transition-colors"
                >
                  😢 悲伤
                </button>
                <button
                  onClick={() => avatar.setEmotion("surprised")}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm rounded-lg transition-colors"
                >
                  😮 惊讶
                </button>
                <button
                  onClick={() => avatar.setEmotion("angry")}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-lg transition-colors"
                >
                  😠 生气
                </button>
                <button
                  onClick={() => avatar.setEmotion("thinking")}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-lg transition-colors"
                >
                  🤔 思考
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：聊天界面 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💬 对话窗口
            </h2>

            {/* 消息列表 */}
            <div className="h-[500px] overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-20">
                  <div className="text-4xl mb-4">👋</div>
                  <p>开始对话吧！Avatar 会根据回复自动变换表情</p>
                </div>
              )}

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
                        : "bg-white text-gray-900 shadow-sm"
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
                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
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
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入框 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入消息，回车发送..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !inputText.trim()}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 如何使用
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>在右侧输入框输入消息并发送</li>
            <li>AI 会生成回复，同时 Avatar 会根据回复内容自动切换表情</li>
            <li>你也可以使用左侧的"手动控制"按钮直接切换表情</li>
            <li>Avatar 会自动眨眼、追踪鼠标视线</li>
            <li>
              <strong>提示</strong>: 尝试问一些开心、悲伤或惊讶的问题，观察 Avatar 的反应
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

