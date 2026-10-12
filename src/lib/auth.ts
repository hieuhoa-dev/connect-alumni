import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema, transaction: true }),
  emailAndPassword: { enabled: true },
  // Registration must also create the application profile through registerWithProfile.
  disabledPaths: ["/sign-up/email"],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [profile] = await db
            .select({ status: schema.profiles.status })
            .from(schema.profiles)
            .where(eq(schema.profiles.userId, session.userId))
            .limit(1);

          if (profile?.status === "locked") {
            throw new APIError("FORBIDDEN", {
              message:
                "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
