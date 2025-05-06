import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// Base config without database adapter for edge compatibility
export const authConfig = {
  providers: [],
  debug: true,
  pages: {
    error: "/api/auth/error", // Custom error page
    signIn: "/login", // Custom sign in page
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = Boolean(auth?.user);
      const isCourse = nextUrl.pathname.startsWith("/courses");

      return true;

      if (isCourse) {
        if (isLoggedIn) {
          return true;
        }

        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      session.user.id = token.sub;

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
