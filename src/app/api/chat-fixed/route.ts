import { NextRequest } from "next/server";
import { openai, withTimeout } from "@/lib/openai";
import { violatesPolicy, refusal } from "@/lib/guard";
import { systemBase, safety, buildPrompt } from "@/lib/prompt";
import { truncate } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
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
      model: "gpt-3.5-turbo", // 使用更便宜的模型
      temperature: 0.7,
      stream: true,
      messages: [
        { role: "system", content: systemBase(tone) },
        { role: "system", content: safety },
        ...recent.map(m => ({ role: m.role, content: buildPrompt(m.content) })),
      ] as { role: "system" | "user" | "assistant"; content: string }[],
    };

    const upstream = await withTimeout(openai.chat.completions.create(payload as any), 30000);

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
    console.error("API_CHAT_ERROR", err);
    return new Response(`Internal Error: ${err.message}`, { status: 500 });
  }
}


