// 文字转语音 (Text-to-Speech) API 端点
// Why: 接收文本，调用 TTS API，返回音频流
// How: 支持 OpenAI TTS 和 ElevenLabs（服务端调用，不暴露 API Key）

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { limiter } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 限流保护
    if (limiter) {
      const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
      const { success } = await limiter.limit(ip);
      if (!success) {
        return new Response("Too many requests", { status: 429 });
      }
    }

    const body = await req.json();
    const { text, voice = "alloy", provider = "openai" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    console.log(`[TTS] Generating speech for: "${text.substring(0, 50)}..."`);

    // 根据 provider 选择不同的 TTS 服务
    if (provider === "openai") {
      return await handleOpenAITTS(text, voice);
    } else if (provider === "elevenlabs") {
      return await handleElevenLabsTTS(text, voice);
    } else {
      return NextResponse.json(
        { error: "Invalid provider. Use 'openai' or 'elevenlabs'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[TTS] Error:", error);
    await logError(error, "API_TTS_ERROR");

    return NextResponse.json(
      {
        error: "Failed to generate speech",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OpenAI TTS 处理
async function handleOpenAITTS(text: string, voice: string) {
  try {
    // OpenAI TTS 支持的 voices: alloy, echo, fable, onyx, nova, shimmer
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // 或 "tts-1-hd" 更高质量
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      response_format: "mp3",
      speed: 1.0, // 0.25 - 4.0
    });

    // 将音频流转换为 Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    console.log(`[TTS] OpenAI speech generated, size: ${buffer.length} bytes`);

    // 返回音频流
    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // 缓存 1 小时
      },
    });
  } catch (error: any) {
    console.error("[TTS] OpenAI error:", error);
    throw error;
  }
}

// ElevenLabs TTS 处理
async function handleElevenLabsTTS(text: string, voiceId: string) {
  try {
    const ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "dummy-key") {
      throw new Error("ElevenLabs API key not configured");
    }

    // ElevenLabs API 调用
    // voice_id 示例: "21m00Tcm4TlvDq8ikWAM" (Rachel)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1", // 或 "eleven_multilingual_v2"
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS] ElevenLabs speech generated, size: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[TTS] ElevenLabs error:", error);
    throw error;
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "tts",
    providers: ["openai", "elevenlabs"],
  });
}

