import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isValidDluEmail } from "@/lib/dlu-email";
import { logAuditEvent } from "@/lib/audit";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      hd: "dlu.edu.vn",
      mapProfileToUser: async (profile) => {
        if (!isValidDluEmail(profile.email)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Hệ thống chỉ chấp nhận tài khoản Google thuộc miền @dlu.edu.vn của Trường Đại học Đà Lạt.",
          });
        }
        return {
          name: profile.name,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        };
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        before: async (acc) => {
          if (acc.providerId === "google") {
            const [existingUser] = await db
              .select()
              .from(schema.user)
              .where(eq(schema.user.id, acc.userId));

            // Mitigation against account pre-hijacking
            if (existingUser && !existingUser.emailVerified) {
              // 1. Revoke all old active sessions
              await db
                .delete(schema.session)
                .where(eq(schema.session.userId, existingUser.id));

              // 2. Remove old password credential
              await db
                .delete(schema.account)
                .where(
                  and(
                    eq(schema.account.userId, existingUser.id),
                    eq(schema.account.providerId, "credential"),
                  ),
                );

              // 3. Mark email verified
              await db
                .update(schema.user)
                .set({ emailVerified: true })
                .where(eq(schema.user.id, existingUser.id));

              // 4. Record audit log
              await logAuditEvent({
                actorId: existingUser.id,
                action: "oauth_link_prehijack_mitigated",
                entityType: "user",
                entityId: existingUser.id,
                metadata: { provider: "google" },
              });
            }
          }
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
