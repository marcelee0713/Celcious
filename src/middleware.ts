import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const root = process.env.NEXTAUTH_URL;
  const pathname = req.nextUrl.pathname;
  let cookie = req.cookies.get("token");

  const exclusiveRoutes =
    pathname.startsWith("/profile") || pathname.startsWith("/cart");

  const authRoutes = pathname.startsWith("/auth");

  if (exclusiveRoutes && !cookie?.value) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.append("callbackUrl", root + pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (authRoutes && cookie?.value) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/cart/:path*", "/auth/:path*"],
};
