// Avatar 相关类型定义
// Why: 统一管理 Avatar 系统的所有类型

export type Emotion = 
  | "neutral"    // 中性
  | "happy"      // 开心
  | "sad"        // 悲伤
  | "angry"      // 生气
  | "surprised"  // 惊讶
  | "confused"   // 困惑
  | "excited"    // 兴奋
  | "thinking";  // 思考

export type Expression = 
  | "default"
  | "smile"
  | "sad"
  | "angry"
  | "surprised"
  | "wink"
  | "embarrassed";

export interface AvatarConfig {
  // 模型配置
  modelPath: string;           // Live2D 模型文件路径
  scale?: number;              // 缩放比例
  x?: number;                  // X 坐标
  y?: number;                  // Y 坐标
  
  // 行为配置
  autoBlinkEnabled?: boolean;  // 自动眨眼
  autoBreathEnabled?: boolean; // 自动呼吸
  mouseLookEnabled?: boolean;  // 鼠标追踪
  idleMotionEnabled?: boolean; // 待机动画
  
  // 表情配置
  defaultExpression?: Expression;
  transitionDuration?: number; // 表情过渡时长（ms）
}

export interface AvatarState {
  isLoaded: boolean;
  currentEmotion: Emotion;
  currentExpression: Expression;
  isSpeaking: boolean;
  error: string | null;
}

export interface AvatarMotion {
  group: string;
  index: number;
  priority?: number;
}

// MBTI 到情绪的映射
export interface MBTIEmotionProfile {
  mbti: string;
  emotionTendency: Emotion[];        // 倾向的情绪
  expressionIntensity: number;       // 表情强度 0-1
  responseDelay: number;             // 反应延迟（ms）
}

// 情绪检测结果
export interface EmotionAnalysis {
  emotion: Emotion;
  confidence: number;    // 置信度 0-1
  keywords: string[];    // 触发关键词
}



