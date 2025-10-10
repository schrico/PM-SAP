// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client that can read the auth cookie
  const supabase = createMiddlewareClient({ req, res });

  // Get the current session (user if logged in)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define public routes (accessible without login)
  const publicRoutes = ["/login"];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is not logged in and trying to access private route
  if (!session && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and tries to visit /login, redirect to dashboard
  if (session && pathname === "/login") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Define which routes the middleware runs on
export const config = {
  matcher: [
    // Protect everything except static files and the API
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
