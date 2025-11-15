import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth0Client, isAuth0Configured } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  if (!isAuth0Configured()) {
    return NextResponse.next();
  }

  const auth0 = getAuth0Client();
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

