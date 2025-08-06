import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simple middleware - will be enhanced with proper auth later
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith("/dashboard")) {
    // For now, allow all dashboard access - proper auth will be added
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}