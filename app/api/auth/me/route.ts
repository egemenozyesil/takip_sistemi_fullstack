import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById } from '@/app/lib/auth';
import { handleApiError } from '@/app/lib/apiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = getUserById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const response: { user: typeof user; token: string; impersonatedBy?: string } = { user, token };
    if (decoded.impersonatedBy) {
      response.impersonatedBy = decoded.impersonatedBy;
    }
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, 'auth/me GET', 'Yetkisiz erişim', 401);
  }
}
