import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Fake simple auth protection
    const authCookie = request.cookies.get('mock_auth_session');

    const response = NextResponse.next();

    // For demo: if not set, set it. In a real app we'd redirect to /login
    if (!authCookie) {
        response.cookies.set('mock_auth_session', 'office-manager-logged-in', { path: '/' });
    }

    return response;
}

export const config = {
    matcher: ['/'],
};
