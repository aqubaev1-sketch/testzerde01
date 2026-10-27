
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Не даём гостям открыть тест или дашборд без cookie сессии.
    "/dashboard/:path*",
    "/testent/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};


































// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//     const session = await auth.api.getSession({
//         headers: await headers()
//     })

//     if (!session) {
//         return NextResponse.redirect(new URL("/login", request.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ["/dashboard/:path*", "/profile/:path*", "/testent/:path*", "/ai-chat/:path*"],
// };

// -----------------------------------------------
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
