import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { Adapter } from "next-auth/adapters";
import { UserWithoutPass } from "@/types/user";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  // adapter: PrismaAdapter(prisma), Uncomment this when you are using Google, Facebook, and Discord Providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch(process.env.NEXTAUTH_URL + "/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
          cache: "no-cache",
        });

        const user: UserWithoutPass = await res.json();
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token, trigger }) {
      if (token) {
        session.user.id = token.id as string;
        const user = await prisma.user.findUnique({
          where: {
            id: session.user.id,
          },
        });

        if (user != null) {
          session.user.image = user.image;
        }
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
