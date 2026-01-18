import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

    // 1. Define the list of public routes that do not need authentication
    const publicRoutes = ["/sign-in", "/sign-up"];

    // 2. If the current path is in the public routes, let it pass
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // 3. Define protected routes
    // You can protect specific paths like '/dashboard' 
    // OR protect everything else by removing the if statement below and just checking the cookie.
    // Here, we ensure '/dashboard' is definitely protected.
    const isProtectedRoute = pathname.startsWith("/dashboard");

    // Note: If you want to protect the entire site except sign-in/up, 
    // you can remove the 'isProtectedRoute' check and just run the cookie check below.

    if (isProtectedRoute && !sessionCookie) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static files and APIs
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
