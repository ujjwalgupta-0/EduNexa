import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // This app runs behind a known Next.js host (localhost in development and
  // the configured deployment host in production). Auth.js requires this
  // when it cannot infer a trusted platform from environment variables.
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Google verifies the mailbox, and the signIn callback below rejects
      // any profile without a verified email. Allow a verified Google identity
      // to link to an existing password account with the same email.
      allowDangerousEmailAccountLinking: true,
      // Use Google's stable OAuth endpoints directly. The default OIDC setup
      // fetches Google's discovery document before it can even redirect the
      // browser, which makes sign-in fail on hosts that block that request.
      type: "oauth",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: { scope: "openid email profile" },
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),

    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password || !user.emailVerified) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          requestedRole: user.requestedRole,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  // Isolate this app's OAuth state from stale cookies left by earlier auth
  // configurations on localhost. Keep the default httpOnly/lax/secure options.
  cookies: {
    state: { name: "edunexa.authjs.state" },
  },

  callbacks: {
    async signIn({ account, profile }) {
      // Only accept Google identities whose mailbox Google has verified.
      if (account?.provider === "google") {
        if (profile?.email_verified !== true || !profile?.email) return false;

        // Auth.js does not update emailVerified when it links Google to an
        // existing password account. Preserve the verified status for that
        // account so approved role-request queues can include it.
        await prisma.user.updateMany({
          where: { email: profile.email.toLowerCase().trim(), emailVerified: null },
          data: { emailVerified: new Date() },
        });
        return true;
      }
      return true;
    },

    async jwt({ token, user, account, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.requestedRole = user.requestedRole ?? null;
        token.googleSignupAt =
          account?.provider === "google" && isNewUser ? Date.now() : null;
      } else if (typeof token.id === "string") {
        // Role approvals happen in the database while the user's JWT session
        // may still be open. Refresh role claims so an approved user can enter
        // their new workspace without needing to sign out and back in.
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, requestedRole: true },
        });
        if (currentUser) {
          token.role = currentUser.role;
          token.requestedRole = currentUser.requestedRole ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.requestedRole = token.requestedRole ?? null;
        session.user.isNewGoogleSignup =
          Number(token.googleSignupAt) > Date.now() - 5 * 60 * 1000;
      }

      return session;
    },
  },
});
