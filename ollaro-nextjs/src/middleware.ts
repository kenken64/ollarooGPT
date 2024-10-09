import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
  
    // const publicUrls = ['/subscribe', '/unsubscribe']
  
    // if (publicUrls.includes(req.nextUrl.pathname)) {
    //   return res
    // }
  
    return res
  }
  
  export const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
  }