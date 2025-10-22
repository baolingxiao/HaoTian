// Live2D 模型管理器
// Why: 封装 Live2D 模型的加载、控制和动画逻辑
// How: 使用 pixi-live2d-display 库

import * as PIXI from "pixi.js";
import type { Live2DModel } from "pixi-live2d-display";
import type { AvatarConfig, Expression } from "@/types/avatar";

// 动态导入 Live2D（避免 SSR 问题）
let Live2DModelInstance: typeof Live2DModel | null = null;

async function loadLive2D() {
  if (typeof window === "undefined") return null;

  if (!Live2DModelInstance) {
    try {
      console.log("[Live2D] Waiting for global objects from CDN...");
      
      // 等待所有全局对象从 <script> 标签加载
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const finalState = {
            hasCubismCore: typeof (window as any).Live2DCubismCore !== 'undefined',
            hasPIXI: typeof (window as any).PIXI !== 'undefined',
            hasLive2DModel: typeof (window as any).PIXI?.live2d?.Live2DModel !== 'undefined',
            PIXI_keys: (window as any).PIXI ? Object.keys((window as any).PIXI).join(', ') : 'N/A',
            PIXI_live2d_keys: (window as any).PIXI?.live2d ? Object.keys((window as any).PIXI.live2d).join(', ') : 'N/A',
          };
          console.error("[Live2D] Timeout after 30 seconds. Final state:", finalState);
          reject(new Error(`Timeout waiting for Live2D libraries (Cubism 4). State: ${JSON.stringify(finalState)}`));
        }, 30000); // 增加到 30 秒
        
        let checkCount = 0;
        const check = () => {
          checkCount++;
          // Cubism 4.x 使用 Live2DCubismCore，不是 Live2D
          const hasCubismCore = typeof (window as any).Live2DCubismCore !== 'undefined';
          const hasPIXI = typeof (window as any).PIXI !== 'undefined';
          const hasLive2DModel = typeof (window as any).PIXI?.live2d?.Live2DModel !== 'undefined';
          
          // 每 10 次检查（1 秒）打印一次日志，避免刷屏
          if (checkCount % 10 === 0 || checkCount === 1) {
            console.log(`[Live2D] Check #${checkCount} (${checkCount * 0.1}s):`, { 
              hasCubismCore, 
              hasPIXI, 
              hasLive2DModel,
              PIXI_live2d: typeof (window as any).PIXI?.live2d,
              PIXI_keys: (window as any).PIXI ? Object.keys((window as any).PIXI).slice(0, 5).join(', ') : 'N/A',
            });
          }
          
          if (hasCubismCore && hasPIXI && hasLive2DModel) {
            clearTimeout(timeout);
            console.log("[Live2D] ✅ All libraries loaded from CDN (Cubism 4)!");
            console.log("[Live2D] PIXI.live2d.Live2DModel:", typeof (window as any).PIXI.live2d.Live2DModel);
            console.log("[Live2D] PIXI.live2d keys:", Object.keys((window as any).PIXI.live2d).join(', '));
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        
        // 立即开始检查，但先等待 DOM 加载完成
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', check);
        } else {
          check();
        }
      });

      // 从全局对象获取 Live2DModel（而非 npm import）
      Live2DModelInstance = (window as any).PIXI.live2d.Live2DModel;
      
      if (!Live2DModelInstance) {
        throw new Error("PIXI.live2d.Live2DModel not found on window object");
      }
      
      console.log("[Live2D] Live2DModel obtained from global PIXI.live2d");
      console.log("[Live2D] Live2DModel.from type:", typeof Live2DModelInstance.from);
    } catch (error) {
      console.error("[Live2D] Failed to load from global objects:", error);
      throw new Error("Failed to load Live2D SDK. Please check /live2d/ scripts");
    }
  }

  return Live2DModelInstance;
}

export class Live2DManager {
  private app: PIXI.Application | null = null;
  private model: any | null = null; // Live2DModel
  private config: AvatarConfig;
  private isLoaded = false;
  
  // 自动行为定时器
  private blinkTimer: NodeJS.Timeout | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  
  constructor(config: AvatarConfig) {
    this.config = {
      scale: 0.15,
      x: 0,
      y: 0,
      autoBlinkEnabled: true,
      autoBreathEnabled: true,
      mouseLookEnabled: true,
      idleMotionEnabled: true,
      defaultExpression: "default",
      transitionDuration: 500,
      ...config,
    };
  }

  /**
   * 初始化 PixiJS 应用
   */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    try {
      console.log("[Live2DManager] Initializing...");
      
      // 创建 PixiJS 应用
      this.app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: canvas.parentElement || undefined,
        backgroundAlpha: 0, // 透明背景
        antialias: true,
      });

      console.log("[Live2DManager] PixiJS initialized");
    } catch (error) {
      console.error("[Live2DManager] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * 加载 Live2D 模型
   */
  async loadModel(modelPath: string): Promise<void> {
    if (!this.app) {
      throw new Error("PixiJS not initialized");
    }

    try {
      console.log("[Live2DManager] Loading model:", modelPath);
      
      const Live2D = await loadLive2D();
      if (!Live2D) {
        throw new Error("Live2D module not loaded");
      }

      // 加载模型
      this.model = await Live2D.from(modelPath);
      
      // 缩放和定位
      this.model.scale.set(this.config.scale!);
      this.model.x = this.app.screen.width / 2 + (this.config.x || 0);
      this.model.y = this.app.screen.height / 2 + (this.config.y || 0);
      
      // 添加到舞台
      this.app.stage.addChild(this.model);
      
      this.isLoaded = true;
      console.log("[Live2DManager] Model loaded successfully");
      
      // 启动自动行为
      this.startAutoBehaviors();
    } catch (error) {
      console.error("[Live2DManager] Failed to load model:", error);
      throw error;
    }
  }

  /**
   * 启动自动行为（眨眼、呼吸、待机动画）
   */
  private startAutoBehaviors(): void {
    // 自动眨眼
    if (this.config.autoBlinkEnabled) {
      this.startAutoBlink();
    }
    
    // 待机动画
    if (this.config.idleMotionEnabled) {
      this.startIdleMotion();
    }
  }

  /**
   * 自动眨眼
   */
  private startAutoBlink(): void {
    const blink = () => {
      if (this.model && this.isLoaded) {
        try {
          // 触发眨眼参数（通常是 ParamEyeLOpen 和 ParamEyeROpen）
          this.model.internalModel?.coreModel?.setParameterValueById?.(
            "ParamEyeLOpen",
            0
          );
          this.model.internalModel?.coreModel?.setParameterValueById?.(
            "ParamEyeROpen",
            0
          );
          
          // 100ms 后睁眼
          setTimeout(() => {
            if (this.model && this.isLoaded) {
              this.model.internalModel?.coreModel?.setParameterValueById?.(
                "ParamEyeLOpen",
                1
              );
              this.model.internalModel?.coreModel?.setParameterValueById?.(
                "ParamEyeROpen",
                1
              );
            }
          }, 100);
        } catch (error) {
          console.warn("[Live2DManager] Blink failed:", error);
        }
      }
      
      // 随机间隔 2-5 秒眨眼
      const nextBlink = 2000 + Math.random() * 3000;
      this.blinkTimer = setTimeout(blink, nextBlink);
    };
    
    blink();
  }

  /**
   * 待机动画
   */
  private startIdleMotion(): void {
    const idle = () => {
      if (this.model && this.isLoaded) {
        try {
          // 播放待机动画（如果有）
          this.model.motion?.("idle");
        } catch (error) {
          console.warn("[Live2DManager] Idle motion failed:", error);
        }
      }
      
      // 每 10 秒播放一次
      this.idleTimer = setTimeout(idle, 10000);
    };
    
    // 延迟 3 秒开始
    setTimeout(idle, 3000);
  }

  /**
   * 设置表情
   */
  setExpression(expression: Expression): void {
    if (!this.model || !this.isLoaded) {
      console.warn("[Live2DManager] Model not loaded");
      return;
    }

    try {
      console.log("[Live2DManager] Setting expression:", expression);
      this.model.expression?.(expression);
    } catch (error) {
      console.error("[Live2DManager] Failed to set expression:", error);
    }
  }

  /**
   * 播放动作
   */
  playMotion(group: string, index: number = 0): void {
    if (!this.model || !this.isLoaded) {
      console.warn("[Live2DManager] Model not loaded");
      return;
    }

    try {
      console.log("[Live2DManager] Playing motion:", group, index);
      this.model.motion?.(group, index);
    } catch (error) {
      console.error("[Live2DManager] Failed to play motion:", error);
    }
  }

  /**
   * 鼠标追踪（视线跟随）
   */
  enableMouseTracking(enable: boolean): void {
    if (!this.model || !this.isLoaded || !this.app) return;

    if (enable) {
      const onMouseMove = (event: MouseEvent) => {
        if (!this.model || !this.app) return;
        
        const rect = this.app.view.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        
        try {
          // 设置视线参数
          this.model.internalModel?.coreModel?.setParameterValueById?.(
            "ParamAngleX",
            x * 30
          );
          this.model.internalModel?.coreModel?.setParameterValueById?.(
            "ParamAngleY",
            -y * 30
          );
          this.model.internalModel?.coreModel?.setParameterValueById?.(
            "ParamBodyAngleX",
            x * 10
          );
        } catch (error) {
          // 静默失败（某些模型可能没有这些参数）
        }
      };
      
      this.app.view.addEventListener("mousemove", onMouseMove);
    }
  }

  /**
   * 说话动画（嘴型同步）
   */
  speak(isSpeaking: boolean): void {
    if (!this.model || !this.isLoaded) return;

    try {
      // 设置嘴巴开合参数
      const mouthValue = isSpeaking ? Math.random() * 0.5 + 0.5 : 0;
      this.model.internalModel?.coreModel?.setParameterValueById?.(
        "ParamMouthOpenY",
        mouthValue
      );
    } catch (error) {
      // 静默失败
    }
  }

  /**
   * 调整大小
   */
  resize(): void {
    if (this.app && this.model) {
      this.model.x = this.app.screen.width / 2 + (this.config.x || 0);
      this.model.y = this.app.screen.height / 2 + (this.config.y || 0);
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    console.log("[Live2DManager] Destroying...");
    
    // 清理定时器
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    // 销毁模型
    if (this.model) {
      this.model.destroy();
      this.model = null;
    }
    
    // 销毁应用
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
    
    this.isLoaded = false;
  }

  /**
   * 获取加载状态
   */
  getIsLoaded(): boolean {
    return this.isLoaded;
  }
}

