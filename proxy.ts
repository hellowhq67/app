import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/pte", "/dashboard", "/checkout"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request);

    // Allow API routes to be handled by their own logic, 
    // but specific protected API routes could be added here if needed.
    // Ensure auth endpoints are always accessible
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Allow webhooks
    if (pathname.startsWith("/api/webhooks")) {
        return NextResponse.next();
    }

    // If user is authenticated but trying to access auth routes (sign-in/sign-up)
    // Redirect to dashboard
    if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/pte/dashboard", request.url));
    }

    // If user is NOT authenticated and trying to access protected routes
    if (!sessionCookie && protectedRoutes.some((route) => pathname.startsWith(route))) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};