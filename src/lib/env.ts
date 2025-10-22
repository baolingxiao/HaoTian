import { cleanEnv, str, port, bool, url } from "envalid";

export const env = cleanEnv(process.env, {
  DATABASE_URL: str({ default: "postgresql://postgres:postgres@localhost:5432/myapp?schema=public" }),
  OPENAI_API_KEY: str({ default: "dummy-key-for-build" }),

  NEXTAUTH_SECRET: str({ default: "dummy-secret-for-build" }),
  NEXTAUTH_URL: url({ default: "http://localhost:3000" }),

  EMAIL_HOST: str({ default: "smtp.example.com" }),
  EMAIL_PORT: port({ default: 587 }),
  EMAIL_USER: str({ default: "user@example.com" }),
  EMAIL_PASS: str({ default: "password" }),
  EMAIL_FROM: str({ default: "no-reply@example.com" }),
  EMAIL_SECURE: bool({ default: false }),

  UPSTASH_REDIS_REST_URL: url({ default: "https://dummy.upstash.io" }),
  UPSTASH_REDIS_REST_TOKEN: str({ default: "dummy-token" }),

  // TTS Provider (ElevenLabs)
  ELEVENLABS_API_KEY: str({ default: "dummy-key" }),
});
