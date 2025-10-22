import { NextRequest } from "next/server";

export async function GET() {
  return new Response("API 测试成功！", { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return new Response(JSON.stringify({ 
      message: "POST 测试成功", 
      received: body 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response("POST 测试失败", { status: 500 });
  }
}


