import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const publicRoutes = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, req) => {
  if (!auth().userId && !publicRoutes(req)) {
    // User is not authenticated and not on a public route, redirect to sign-up
    const signUpUrl = new URL('/sign-up', req.url)
    signUpUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signUpUrl)
  }

  if (auth().userId && publicRoutes(req)) {
    // User is authenticated but on a public route, redirect to home
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Allow the request to proceed for all other cases
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}