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

        if (!user || !user.password) {
          return null;
        }

        if (!user.emailVerified) {
          const pendingVerification = await prisma.verificationToken.findFirst({
            where: { identifier: email },
            select: { identifier: true },
          });
          if (pendingVerification) return null;
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
    async jwt({ token, user, account, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.requestedRole = user.requestedRole ?? null;
        token.googleSignupAt =
          account?.provider === "google" && isNewUser ? Date.now() : null;
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
