import { NextRequest } from "next/server";
import { openai, withTimeout } from "@/lib/openai";
import { limiter } from "@/lib/ratelimit";
import { violatesPolicy, refusal } from "@/lib/guard";
import { systemBase, safety, buildPrompt } from "@/lib/prompt";
import { truncate } from "@/lib/session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const runtime = "nodejs"; // 改为 nodejs 以支持 Prisma

export async function POST(req: NextRequest) {
  try {
    // 基本限流（如果Redis可用）
    if (limiter) {
      const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
      const { success } = await limiter.limit(ip);
      if (!success) {
        return new Response("Too Many Requests", { status: 429 });
      }
    }

    const { chatId, messages, tone } = await req.json();

    // 输入治理
    const last = messages[messages.length - 1]?.content || "";
    if (violatesPolicy(last)) {
      return new Response(refusal, { status: 200 });
    }

    // 会话截断
    const recent = truncate(messages, 12);

    // 组装 messages
    const payload = {
      model: "gpt-4o-mini", // 可替换为你的默认模型
      temperature: 0.7,
      stream: true,
      messages: [
        { role: "system", content: systemBase(tone) },
        { role: "system", content: safety },
        ...recent.map(m => ({ role: m.role, content: buildPrompt(m.content) })),
      ] as { role: "system" | "user" | "assistant"; content: string }[],
    };

    const upstream = await withTimeout(openai.chat.completions.create(payload as any), 45000);

    // 将 OpenAI 的 event stream 透传为 SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            // @ts-ignore openai sdk stream iterator
            for await (const part of upstream) {
              const delta = part.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(`data: ${delta}\n\n`));
            }
            controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
            controller.close();

            // 写入数据库（只存完整文本：此处省略累计逻辑，生产中建议在前端累积后回传）
            await prisma.message.create({
              data: { chatId, role: "assistant", content: "[streamed]" },
            });
          } catch (e) {
            controller.error(e);
          }
        })();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    logError(err, "API_CHAT_ERROR");
    return new Response("Internal Error", { status: 500 });
  }
}
