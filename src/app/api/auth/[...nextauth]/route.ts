import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { Adapter } from "next-auth/adapters";
import { UserWithoutPass } from "@/types/user";
import jwt from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";

const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
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
        token: { type: "text" },
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
        if (credentials?.token !== "null") {
          const token = credentials?.token;
          console.log("The token: " + token);
          try {
            jwt.verify(token as string, process.env.NEXTAUTH_SECRET as string);
          } catch (e) {
            throw new Error("Email verification has been expired");
          }

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              emailVerified: new Date(),
            },
          });

          return user;
        }

        if (user && !user.emailVerified) {
          throw new Error("Email is not verified, please check your inbox.");
        }

        if (user) {
          const token = jwt.sign(
            {
              id: user.id,
            },
            secret as string,
            { expiresIn: "30d" }
          );
          cookies().set({
            name: "token",
            value: token,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          });
          return user;
        } else {
          throw new Error("Please check your credentials!");
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
    async session({ session, token }) {
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
  events: {
    signOut() {
      cookies().set({
        name: "token",
        value: "",
        httpOnly: true,
        expires: 0,
        path: "/",
      });
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
