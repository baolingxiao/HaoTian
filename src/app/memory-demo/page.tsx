// Memory 演示页面
// Why: 展示 useMemory Hook 的所有功能
// How: 提供完整的 UI 来管理用户配置、聊天记录和摘要

"use client";

import { useState, useEffect } from "react";
import { useMemory } from "@/hooks/useMemory";
import type { UserProfile, ChatSummary, ChatMessage } from "@/types/memory";

export default function MemoryDemoPage() {
  const memory = useMemory();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [inputName, setInputName] = useState("");
  const [inputMBTI, setInputMBTI] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  // 加载用户配置
  useEffect(() => {
    if (memory.isReady) {
      loadProfile();
      loadChats();
    }
  }, [memory.isReady]);

  const loadProfile = async () => {
    const p = await memory.getProfile();
    setProfile(p);
    setInputName(p?.name || "");
    setInputMBTI(p?.mbti || "");
  };

  const loadChats = async () => {
    const chatList = await memory.listChats(20);
    setChats(chatList);
  };

  const loadMessages = async (chatId: string) => {
    const msgs = await memory.getChatMessages(chatId);
    setMessages(msgs);
    setCurrentChatId(chatId);
  };

  // 保存用户配置
  const handleSaveProfile = async () => {
    if (!inputName.trim()) {
      alert("请输入用户名");
      return;
    }

    await memory.setName(inputName);
    if (inputMBTI) {
      await memory.setMBTI(inputMBTI);
    }
    
    await loadProfile();
    alert("配置已保存！");
  };

  // 创建新对话
  const handleCreateChat = async () => {
    const title = prompt("输入对话标题（可选）") || undefined;
    const chatId = await memory.createChat(title);
    await loadChats();
    setCurrentChatId(chatId);
    setMessages([]);
    alert(`新对话已创建: ${chatId}`);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!currentChatId) {
      alert("请先创建或选择一个对话");
      return;
    }

    if (!inputMessage.trim()) {
      return;
    }

    // 保存用户消息
    await memory.saveMessage({
      chatId: currentChatId,
      role: "user",
      content: inputMessage,
      metadata: {},
    });

    // 模拟 AI 回复
    await memory.saveMessage({
      chatId: currentChatId,
      role: "assistant",
      content: `收到: ${inputMessage}`,
      emotion: "happy",
      metadata: {},
    });

    setInputMessage("");
    await loadMessages(currentChatId);
    await loadChats();
  };

  // 生成摘要
  const handleGenerateSummary = async (chatId: string) => {
    await memory.generateSummary(chatId);
    await loadChats();
    alert("摘要已生成！");
  };

  // 删除对话
  const handleDeleteChat = async (chatId: string) => {
    if (confirm("确定要删除这个对话吗？")) {
      await memory.deleteChat(chatId);
      await loadChats();
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  };

  // 导出数据
  const handleExport = async () => {
    const blob = await memory.export();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("数据已导出！");
  };

  // 导入数据
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("导入数据将覆盖现有数据，确定继续吗？")) {
      await memory.import(file);
      await loadProfile();
      await loadChats();
      alert("数据已导入！");
    }
  };

  // 清空数据
  const handleClear = async () => {
    if (confirm("确定要清空所有数据吗？此操作不可恢复！")) {
      await memory.clear();
      await loadProfile();
      await loadChats();
      setCurrentChatId(null);
      setMessages([]);
      alert("数据已清空！");
    }
  };

  if (!memory.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">初始化本地数据库...</p>
        </div>
      </div>
    );
  }

  if (memory.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">初始化失败</h2>
          <p className="text-red-600 text-sm">{memory.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 Memory System Demo
          </h1>
          <p className="text-gray-600">
            浏览器端本地数据库 (DuckDB WASM)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户配置 */}
          <div className="space-y-6">
            {/* 用户配置 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                👤 用户配置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="输入你的名字"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MBTI 类型
                  </label>
                  <select
                    value={inputMBTI}
                    onChange={(e) => setInputMBTI(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">选择 MBTI</option>
                    <option value="INTJ">INTJ</option>
                    <option value="INTP">INTP</option>
                    <option value="ENTJ">ENTJ</option>
                    <option value="ENTP">ENTP</option>
                    <option value="INFJ">INFJ</option>
                    <option value="INFP">INFP</option>
                    <option value="ENFJ">ENFJ</option>
                    <option value="ENFP">ENFP</option>
                    <option value="ISTJ">ISTJ</option>
                    <option value="ISFJ">ISFJ</option>
                    <option value="ESTJ">ESTJ</option>
                    <option value="ESFJ">ESFJ</option>
                    <option value="ISTP">ISTP</option>
                    <option value="ISFP">ISFP</option>
                    <option value="ESTP">ESTP</option>
                    <option value="ESFP">ESFP</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  保存配置
                </button>
              </div>

              {profile && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <p>创建时间: {new Date(profile.createdAt).toLocaleString()}</p>
                  <p>更新时间: {new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* 统计信息 */}
            {memory.stats && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 统计信息
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">对话数</span>
                    <span className="font-semibold">{memory.stats.totalChats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">消息数</span>
                    <span className="font-semibold">{memory.stats.totalMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">摘要数</span>
                    <span className="font-semibold">{memory.stats.totalSummaries}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 数据管理 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🛠️ 数据管理
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  📤 导出数据
                </button>
                
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg text-center cursor-pointer transition-colors">
                    📥 导入数据
                  </div>
                </label>
                
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                >
                  🗑️ 清空数据
                </button>
              </div>
            </div>
          </div>

          {/* 中间：对话列表 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                💬 对话列表
              </h2>
              <button
                onClick={handleCreateChat}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
              >
                + 新对话
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {chats.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                  暂无对话，点击"新对话"开始
                </p>
              )}

              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => loadMessages(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.messageCount} 条消息
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateSummary(chat.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="生成摘要"
                      >
                        📝
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {chat.summary && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {chat.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：消息列表 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💭 消息记录
            </h2>

            {!currentChatId && (
              <p className="text-center text-gray-500 py-20">
                请选择一个对话
              </p>
            )}

            {currentChatId && (
              <>
                <div className="h-[450px] overflow-y-auto mb-4 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 py-10">
                      暂无消息
                    </p>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-50 ml-auto max-w-[80%]"
                          : "bg-gray-50 mr-auto max-w-[80%]"
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {msg.role === "user" ? "你" : "AI"}
                        {msg.emotion && ` · ${msg.emotion}`}
                      </div>
                      <p className="text-sm text-gray-900">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入消息..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    发送
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



