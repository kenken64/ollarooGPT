import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from './app/lib/jwt';

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Handle the root path
    if (pathname === '/' || pathname === '/auth/login' || pathname === '/auth/register') {
        console.log('Root path accessed');
        // You can add additional logic here, such as redirection, logging, etc.
        return NextResponse.next();
    }

    // Handle other paths that require authentication (e.g., /api/protected)
    // this token is send down by the client code
    const token = req.headers.get('authorization')?.split(' ')[1];
    console.log(token)
    // any path within the protected url will be check with the token on the header
    if (pathname.startsWith('/api/protected')) {
        if (!token) {
        return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });
        }

        const verified = verifyToken(token);
        if (!verified) {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
    }
    
    return NextResponse.next();
  }
  
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico).*)', // Matches all except the excluded paths
      '/api/protected/:path*', // Specifically match the /api/protected path and its subpaths
    ],
  };