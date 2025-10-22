import OpenAI from "openai";
import { env } from "./env";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// 简单超时包装
export async function withTimeout<T>(p: Promise<T>, ms = 30000) {
  return await Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Upstream timeout")), ms)),
  ]);
}
