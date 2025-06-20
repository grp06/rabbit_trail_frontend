import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle Chrome DevTools specific requests
  if (
    request.nextUrl.pathname ===
    '/.well-known/appspecific/com.chrome.devtools.json'
  ) {
    // Return an empty JSON response to satisfy Chrome DevTools
    return new NextResponse('{}', {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/.well-known/:path*',
}
