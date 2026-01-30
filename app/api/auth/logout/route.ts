import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/apiError';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Başarıyla çıkış yapıldı' },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'auth/logout POST', 'Çıkış işlemi başarısız', 400);
  }
}
