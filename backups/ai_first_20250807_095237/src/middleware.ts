import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't need authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/demo"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Protected routes - require authentication
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/customers")) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      // Redirect to signin for dashboard routes
      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
      }
      // Return 401 for API routes
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Add tenant info to headers for API routes
    if (pathname.startsWith("/api/") && token.tenantId) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-tenant-id", token.tenantId as string)
      requestHeaders.set("x-user-id", token.sub as string)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/customers/:path*",
    "/api/auth/:path*"
  ]
}