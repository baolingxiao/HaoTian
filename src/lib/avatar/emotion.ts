// 情绪分析和映射系统
// Why: 从 LLM 回复文本中检测情绪，映射到 Avatar 表情
// How: 基于关键词匹配 + 上下文分析

import type { Emotion, EmotionAnalysis, Expression } from "@/types/avatar";

// 情绪关键词字典
const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  happy: [
    "开心", "高兴", "快乐", "哈哈", "😊", "😄", "太好了", "不错", "棒",
    "喜欢", "爱", "满意", "愉快", "欣喜", "兴奋"
  ],
  sad: [
    "难过", "伤心", "悲伤", "😢", "😭", "遗憾", "失望", "沮丧",
    "不开心", "郁闷", "难受", "痛苦"
  ],
  angry: [
    "生气", "愤怒", "😠", "😡", "讨厌", "烦", "气死了", "可恶",
    "恼火", "不爽", "暴躁"
  ],
  surprised: [
    "惊讶", "震惊", "😮", "😲", "哇", "天哪", "不会吧", "真的吗",
    "意外", "没想到", "竟然"
  ],
  confused: [
    "困惑", "疑惑", "🤔", "不明白", "不懂", "不理解", "怎么回事",
    "为什么", "奇怪", "迷茫"
  ],
  excited: [
    "兴奋", "激动", "✨", "🎉", "太棒了", "好耶", "赞", "超级",
    "非常", "极了", "爆炸"
  ],
  thinking: [
    "思考", "想想", "考虑", "🤔", "让我想想", "嗯", "这样啊",
    "分析", "琢磨", "研究"
  ],
  neutral: [], // 默认情绪
};

/**
 * 从文本中分析情绪
 */
export function analyzeEmotion(text: string): EmotionAnalysis {
  const cleanText = text.toLowerCase().trim();
  
  // 情绪得分统计
  const emotionScores: Record<Emotion, number> = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    confused: 0,
    excited: 0,
    thinking: 0,
  };

  const matchedKeywords: string[] = [];

  // 统计每个情绪的关键词出现次数
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      const count = (cleanText.match(new RegExp(keyword, "g")) || []).length;
      if (count > 0) {
        emotionScores[emotion as Emotion] += count;
        matchedKeywords.push(keyword);
      }
    }
  }

  // 找出得分最高的情绪
  let maxEmotion: Emotion = "neutral";
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion as Emotion;
    }
  }

  // 计算置信度（基于关键词密度）
  const wordCount = cleanText.split(/\s+/).length;
  const confidence = Math.min(maxScore / Math.max(wordCount * 0.2, 1), 1);

  return {
    emotion: maxEmotion,
    confidence,
    keywords: matchedKeywords,
  };
}

/**
 * 情绪到 Live2D 表情的映射
 */
export const EMOTION_TO_EXPRESSION: Record<Emotion, Expression> = {
  neutral: "default",
  happy: "smile",
  sad: "sad",
  angry: "angry",
  surprised: "surprised",
  confused: "embarrassed",
  excited: "smile",
  thinking: "default",
};

/**
 * 获取表情名称
 */
export function getExpression(emotion: Emotion): Expression {
  return EMOTION_TO_EXPRESSION[emotion] || "default";
}

/**
 * MBTI 驱动的情绪倾向
 * Why: 不同性格类型对相同文本可能有不同的情绪反应
 */
export const MBTI_EMOTION_PROFILES: Record<string, EmotionAnalysis["emotion"][]> = {
  // 分析型
  INTJ: ["thinking", "neutral", "confused"],
  INTP: ["thinking", "surprised", "confused"],
  ENTJ: ["excited", "thinking", "neutral"],
  ENTP: ["excited", "happy", "surprised"],
  
  // 外交家型
  INFJ: ["happy", "sad", "thinking"],
  INFP: ["happy", "sad", "excited"],
  ENFJ: ["happy", "excited", "surprised"],
  ENFP: ["excited", "happy", "surprised"],
  
  // 守护者型
  ISTJ: ["neutral", "thinking", "confused"],
  ISFJ: ["happy", "sad", "neutral"],
  ESTJ: ["neutral", "angry", "thinking"],
  ESFJ: ["happy", "excited", "sad"],
  
  // 探险家型
  ISTP: ["neutral", "thinking", "surprised"],
  ISFP: ["happy", "sad", "excited"],
  ESTP: ["excited", "happy", "angry"],
  ESFP: ["excited", "happy", "surprised"],
};

/**
 * 基于 MBTI 调整情绪分析结果
 */
export function adjustEmotionByMBTI(
  emotion: Emotion,
  mbti: string,
  confidence: number
): EmotionAnalysis {
  const profile = MBTI_EMOTION_PROFILES[mbti.toUpperCase()];
  
  if (!profile) {
    return { emotion, confidence, keywords: [] };
  }

  // 如果检测到的情绪在该 MBTI 的倾向列表中，提高置信度
  if (profile.includes(emotion)) {
    return {
      emotion,
      confidence: Math.min(confidence * 1.2, 1),
      keywords: [],
    };
  }

  // 如果置信度较低，使用 MBTI 的默认情绪
  if (confidence < 0.3) {
    return {
      emotion: profile[0],
      confidence: 0.5,
      keywords: [],
    };
  }

  return { emotion, confidence, keywords: [] };
}

/**
 * 从 LLM 响应中提取情绪标签
 * Why: LLM 可能在回复中包含 [emotion:happy] 这样的标签
 */
export function extractEmotionTag(text: string): Emotion | null {
  const match = text.match(/\[emotion:(\w+)\]/i);
  if (match && match[1]) {
    const emotion = match[1].toLowerCase() as Emotion;
    if (Object.keys(EMOTION_KEYWORDS).includes(emotion)) {
      return emotion;
    }
  }
  return null;
}

/**
 * 清除文本中的情绪标签
 */
export function removeEmotionTags(text: string): string {
  return text.replace(/\[emotion:\w+\]/gi, "").trim();
}



