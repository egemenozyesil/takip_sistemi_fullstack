import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById } from '@/app/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
}

/**
 * Request'ten token alıp doğrular ve kullanıcının admin olduğunu kontrol eder.
 * Admin değilse Error fırlatır.
 */
export function getAdminFromRequest(request: NextRequest): AdminUser {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    const err = new Error('Yetkisiz');
    (err as any).status = 401;
    throw err;
  }
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
  const user = getUserById(decoded.id) as AdminUser | undefined;
  if (!user || user.role !== 'admin') {
    const err = new Error('Bu işlem için admin yetkisi gerekir');
    (err as any).status = 403;
    throw err;
  }
  return user;
}
