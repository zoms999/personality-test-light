import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin**';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

// JWT secret key
const getSecretKey = () => new TextEncoder().encode(SESSION_SECRET);

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Create session token
export async function createSession(): Promise<string> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  return token;
}

// Verify session token
export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

// Get session from cookie
export async function getSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value;
}

// Delete session cookie
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSession();
  if (!token) return false;
  return verifySession(token);
}
