import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 开始处理聊天请求...");
    
    const { messages } = await req.json();
    console.log("📝 收到消息:", messages);
    
    // 简单的 OpenAI 调用
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个友好的中文助手。"
        },
        ...messages
      ],
      max_tokens: 100,
      temperature: 0.7
    });
    
    console.log("✅ OpenAI 响应成功");
    
    return new Response(JSON.stringify({
      message: response.choices[0].message.content,
      usage: response.usage
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error: any) {
    console.log("❌ 聊天 API 错误:", error.message);
    return new Response(JSON.stringify({
      error: error.message,
      type: error.constructor.name
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}


