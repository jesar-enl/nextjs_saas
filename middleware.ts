import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/signin', '/signup', '/', '/home']);

const isPublicApiRoute = createRouteMatcher(['/api/videos']);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  const currentUrl = new URL(req.url);

  const isAccessingHomepage = currentUrl.pathname === '/home';
  const isApiRequest = currentUrl.pathname.startsWith('/api');

  // if user is logged in and trying to access a protected route, but not the homepage, redirect to home
  if (userId && isPublicRoute(req) && !isAccessingHomepage) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  // if not logged in
  if (!userId) {
    // if user is trying to access a private route, redirect to signin
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    // if user is trying to access an API route, redirect to signin
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
