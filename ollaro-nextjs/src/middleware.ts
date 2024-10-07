import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    console.log(request)
    return NextResponse.json({ message: 'Auth required' }, { status: 401 })
    //return NextResponse.redirect(new URL("/", request.nextUrl));
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/"],
  };