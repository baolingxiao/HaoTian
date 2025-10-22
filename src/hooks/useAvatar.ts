// useAvatar Hook - Avatar 状态管理
// Why: 封装 Avatar 的加载、表情切换、动作播放逻辑
// How: 管理 Live2DManager 实例和状态

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Live2DManager } from "@/lib/avatar/live2d-manager";
import {analyzeEmotion, getExpression, extractEmotionTag, removeEmotionTags } from "@/lib/avatar/emotion";
import type { AvatarConfig, AvatarState, Emotion, Expression } from "@/types/avatar";

export interface UseAvatarReturn {
  // 状态
  state: AvatarState;
  
  // 方法
  init: (canvas: HTMLCanvasElement) => Promise<void>;
  setEmotion: (emotion: Emotion) => void;
  setExpression: (expression: Expression) => void;
  speak: (isSpeaking: boolean) => void;
  playMotion: (group: string, index?: number) => void;
  analyzeText: (text: string) => void;
  destroy: () => void;
}

const DEFAULT_CONFIG: AvatarConfig = {
  modelPath: "/models/live2d/default/model.json",
  scale: 0.15,
  x: 0,
  y: 0,
  autoBlinkEnabled: true,
  autoBreathEnabled: true,
  mouseLookEnabled: true,
  idleMotionEnabled: true,
  defaultExpression: "default",
  transitionDuration: 500,
};

export function useAvatar(config?: Partial<AvatarConfig>): UseAvatarReturn {
  const [state, setState] = useState<AvatarState>({
    isLoaded: false,
    currentEmotion: "neutral",
    currentExpression: "default",
    isSpeaking: false,
    error: null,
  });

  const managerRef = useRef<Live2DManager | null>(null);
  const configRef = useRef<AvatarConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  /**
   * 初始化 Avatar
   */
  const init = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      console.log("[useAvatar] Initializing...");
      
      // 创建管理器
      const manager = new Live2DManager(configRef.current);
      managerRef.current = manager;

      // 初始化 PixiJS
      await manager.init(canvas);

      // 加载模型
      await manager.loadModel(configRef.current.modelPath);

      // 启用鼠标追踪
      if (configRef.current.mouseLookEnabled) {
        manager.enableMouseTracking(true);
      }

      setState((prev) => ({
        ...prev,
        isLoaded: true,
        error: null,
      }));

      console.log("[useAvatar] Initialization complete");
    } catch (error: any) {
      console.error("[useAvatar] Initialization failed:", error);
      setState((prev) => ({
        ...prev,
        isLoaded: false,
        error: error.message || "Failed to load avatar",
      }));
    }
  }, []);

  /**
   * 设置情绪
   */
  const setEmotion = useCallback((emotion: Emotion) => {
    if (!managerRef.current) return;

    console.log("[useAvatar] Setting emotion:", emotion);
    
    const expression = getExpression(emotion);
    managerRef.current.setExpression(expression);

    setState((prev) => ({
      ...prev,
      currentEmotion: emotion,
      currentExpression: expression,
    }));
  }, []);

  /**
   * 直接设置表情
   */
  const setExpression = useCallback((expression: Expression) => {
    if (!managerRef.current) return;

    console.log("[useAvatar] Setting expression:", expression);
    managerRef.current.setExpression(expression);

    setState((prev) => ({
      ...prev,
      currentExpression: expression,
    }));
  }, []);

  /**
   * 说话状态
   */
  const speak = useCallback((isSpeaking: boolean) => {
    if (!managerRef.current) return;

    managerRef.current.speak(isSpeaking);

    setState((prev) => ({
      ...prev,
      isSpeaking,
    }));
  }, []);

  /**
   * 播放动作
   */
  const playMotion = useCallback((group: string, index: number = 0) => {
    if (!managerRef.current) return;

    console.log("[useAvatar] Playing motion:", group, index);
    managerRef.current.playMotion(group, index);
  }, []);

  /**
   * 从文本分析情绪并应用
   */
  const analyzeText = useCallback((text: string) => {
    if (!managerRef.current) return;

    console.log("[useAvatar] Analyzing text:", text.substring(0, 50));

    // 1. 检查是否有显式情绪标签
    const taggedEmotion = extractEmotionTag(text);
    if (taggedEmotion) {
      console.log("[useAvatar] Found emotion tag:", taggedEmotion);
      setEmotion(taggedEmotion);
      return;
    }

    // 2. 分析文本情绪
    const cleanText = removeEmotionTags(text);
    const analysis = analyzeEmotion(cleanText);

    console.log("[useAvatar] Emotion analysis:", analysis);

    // 3. 如果置信度足够高，应用情绪
    if (analysis.confidence > 0.3) {
      setEmotion(analysis.emotion);
    }
  }, [setEmotion]);

  /**
   * 销毁 Avatar
   */
  const destroy = useCallback(() => {
    if (managerRef.current) {
      console.log("[useAvatar] Destroying...");
      managerRef.current.destroy();
      managerRef.current = null;

      setState({
        isLoaded: false,
        currentEmotion: "neutral",
        currentExpression: "default",
        isSpeaking: false,
        error: null,
      });
    }
  }, []);

  // 窗口大小变化时调整
  useEffect(() => {
    const handleResize = () => {
      if (managerRef.current) {
        managerRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 组件卸载时销毁
  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  return {
    state,
    init,
    setEmotion,
    setExpression,
    speak,
    playMotion,
    analyzeText,
    destroy,
  };
}



