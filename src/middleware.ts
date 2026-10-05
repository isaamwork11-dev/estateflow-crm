export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/today/:path*',
    '/leads/:path*',
    '/properties/:path*',
    '/site-visits/:path*',
    '/deals/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/tools/:path*',
  ],
};
