import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/lib/env";

const handler = NextAuth({
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
        secure: env.EMAIL_SECURE,
      },
      from: env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
});

export { handler as GET, handler as POST };
