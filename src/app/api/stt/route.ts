// 语音转文字 (Speech-to-Text) API 端点
// Why: 接收浏览器上传的音频文件，调用 Whisper API 进行转写
// How: 使用 OpenAI Whisper API (服务端调用，不暴露 API Key)

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { limiter } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs"; // Whisper API 需要 Node.js runtime

export async function POST(req: NextRequest) {
  try {
    // 限流保护
    if (limiter) {
      const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    // 解析 FormData (音频文件)
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = formData.get("language") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log(`[STT] Processing audio: ${audioFile.name}, size: ${audioFile.size} bytes`);

    // 调用 OpenAI Whisper API
    // Why: 服务端调用，API Key 不暴露给客户端
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language || undefined, // 可选：指定语言（如 'zh', 'en'）
      response_format: "verbose_json", // 获取更多信息（时长、置信度等）
    });

    console.log(`[STT] Transcription success: "${transcription.text}"`);

    // 返回转写结果
    return NextResponse.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
    });
  } catch (error: any) {
    console.error("[STT] Error:", error);
    await logError(error, "API_STT_ERROR");

    // 返回友好的错误信息
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({ status: "ok", service: "stt" });
}

