import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'admin_session_token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'crm-voice-agent-auth-secret-key-2026';

// Paths that NEVER require authentication
const PUBLIC_PREFIXES = [
  '/login',
  '/demo',
  '/logo-light.png',
  '/3knotslogo.png',
  '/api/auth',
  '/api/admin/seed-admin',
  '/api/webhooks/post-call',
  '/api/tools/lookup-caller',
  '/api/leads/create-chat-lead',
  '/api/chats/save',
  '/api/inngest',
  '/api/send-email',
  '/api/general-email',
  '/api/send-marketing-plan',
  '/api/marketing-plans',
  '/api/email-templates',
  '/api/ghostwriting-plans',
  '/api/send-ghostwriting-plan',
  '/api/validate-card',
  '/api/contracts',
  '/api/chat', // Allow public access to chat API
  '/api/webhook/messenger', // Allow Meta Webhook public access
  '/_next',
  '/favicon.ico',
  '/api/conversations', // For audio playback if needed
];

async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    if (!token || !token.includes('.')) return false;
    const [dataBase64, signature] = token.split('.');

    // Import HMAC key using Web Crypto API (100% Edge compatible)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(dataBase64));
    
    // Convert signature back to base64url
    const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSigBuffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedBase64) {
      return false;
    }

    // Decode and verify expiration
    const jsonStr = atob(dataBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr);

    if (payload.exp && payload.exp < Date.now()) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if route is public or an external webhook
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) {
    // If user is already authenticated and visits /login, redirect to dashboard
    if (pathname === '/login') {
      const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token && (await verifyTokenEdge(token))) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Validate Session Cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isValid = token ? await verifyTokenEdge(token) : false;

  if (!isValid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, images, favicons, and media
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|css|js)$).*)',
  ],
};
