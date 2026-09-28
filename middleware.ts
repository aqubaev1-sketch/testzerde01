import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/testent/:path*", "/ai-chat/:path*"],
};


// middleware.ts
// import { getSessionCookie } from "better-auth/cookies";
// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const sessionCookie = getSessionCookie(request);

//   if (!sessionCookie) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*", "/testent/:path*", "/ai-chat/:path*"],
// };