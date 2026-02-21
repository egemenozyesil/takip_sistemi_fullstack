import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { handleApiError } from '@/app/lib/apiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const currentToken = request.cookies.get('token')?.value;
    if (!currentToken) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    const decoded = jwt.decode(currentToken) as { impersonatedBy?: string } | null;
    if (!decoded?.impersonatedBy) {
      return NextResponse.json(
        { error: 'Öğrenci olarak giriş modunda değilsiniz' },
        { status: 400 }
      );
    }
    const restoreToken = request.cookies.get('admin_restore_token')?.value;
    if (!restoreToken) {
      return NextResponse.json(
        { error: 'Admin oturumu bulunamadı' },
        { status: 400 }
      );
    }
    jwt.verify(restoreToken, JWT_SECRET);

    const response = NextResponse.json({ message: 'Yönetici oturumuna dönüldü' }, { status: 200 });
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60,
    };
    response.cookies.set('token', restoreToken, cookieOpts);
    response.cookies.set('admin_restore_token', '', { ...cookieOpts, maxAge: 0 });
    return response;
  } catch (error: unknown) {
    return handleApiError(error, 'admin/impersonate-end POST', 'Çıkış yapılamadı', 500);
  }
}
