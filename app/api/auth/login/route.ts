import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/app/lib/auth';
import { handleApiError } from '@/app/lib/apiError';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    const user = await loginUser({ email, password });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: 'Başarıyla giriş yapıldı',
        user,
        token
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'auth/login POST', 'Giriş işlemi başarısız', 401);
  }
}
