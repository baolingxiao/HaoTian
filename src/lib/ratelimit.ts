import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

// 检查Redis配置是否有效
const isRedisConfigured = env.UPSTASH_REDIS_REST_URL !== "https://dummy.upstash.io" && 
                          env.UPSTASH_REDIS_REST_TOKEN !== "dummy-token";

const redis = isRedisConfigured ? new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

export const limiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"), // 每分钟 60 次
  analytics: true,
}) : null;
