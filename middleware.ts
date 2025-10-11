// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client bound to the request/response
  const supabase = createMiddlewareClient({ req, res });

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define routes accessible without login
  const publicRoutes = ["/login"];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // ✅ Redirect unauthenticated users trying to access private routes
  if (!session && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);

    // Important: return redirect *with cookies from supabase client*
    return NextResponse.redirect(redirectUrl, { headers: res.headers });
  }

  // ✅ Redirect authenticated users away from /login
  if (session && pathname === "/login") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";

    // Important: return redirect *with cookies*
    return NextResponse.redirect(redirectUrl, { headers: res.headers });
  }

  // ✅ Always return `res` (the modified one)
  return res;
}

// Define which routes middleware applies to
export const config = {
  matcher: [
    // Protect all routes except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
