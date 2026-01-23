import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, name, studentNumber, department, phone } = data;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, şifre ve ad gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const user = await registerUser({
      email,
      password,
      name,
      studentNumber,
      department,
      phone
    });

    return NextResponse.json(
      { message: 'Başarıyla kayıt olundu', user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kayıt işlemi başarısız' },
      { status: 400 }
    );
  }
}
