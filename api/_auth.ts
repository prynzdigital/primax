import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const COOKIE_NAME = 'primax_admin_session';

export interface SessionPayload {
  sub: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set. Configure it in your Vercel project environment variables.');
  return secret;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  );
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

export function getSessionFromRequest(req: VercelRequest): SessionPayload | null {
  const cookies = parse(req.headers.cookie ?? '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

/** Returns the session if present, otherwise writes a 401 and returns null. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): SessionPayload | null {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Not authenticated.' });
    return null;
  }
  return session;
}
