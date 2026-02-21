import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdminFromRequest } from '@/app/lib/adminAuth';
import { getStudentById } from '@/app/lib/students';
import { getUserById } from '@/app/lib/auth';
import { handleApiError } from '@/app/lib/apiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const IMPERSONATION_MAX_AGE = 60 * 60; // 1 saat

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    const body = await request.json();
    const { studentId } = body;
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId gereklidir' },
        { status: 400 }
      );
    }
    const student = getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
    }
    const targetUser = getUserById(student.user_id) as { id: string; email: string; name: string } | undefined;
    if (!targetUser) {
      return NextResponse.json({ error: 'Öğrenci kullanıcısı bulunamadı' }, { status: 404 });
    }

    const currentToken = request.cookies.get('token')?.value;
    if (!currentToken) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const impersonationToken = jwt.sign(
      { id: targetUser.id, email: targetUser.email, name: targetUser.name, impersonatedBy: admin.id },
      JWT_SECRET,
      { expiresIn: IMPERSONATION_MAX_AGE }
    );

    const response = NextResponse.json({ message: 'Öğrenci olarak giriş yapıldı' }, { status: 200 });
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };
    response.cookies.set('admin_restore_token', currentToken, {
      ...cookieOpts,
      maxAge: IMPERSONATION_MAX_AGE,
    });
    response.cookies.set('token', impersonationToken, {
      ...cookieOpts,
      maxAge: IMPERSONATION_MAX_AGE,
    });
    return response;
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status ?? 500;
    return handleApiError(error, 'admin/impersonate POST', 'Öğrenci olarak giriş yapılamadı', status);
  }
}
