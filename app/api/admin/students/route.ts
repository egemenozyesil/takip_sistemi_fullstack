import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/app/lib/adminAuth';
import { getAllStudentsWithUser } from '@/app/lib/students';
import { registerUser } from '@/app/lib/auth';
import { handleApiError } from '@/app/lib/apiError';

export async function GET(request: NextRequest) {
  try {
    getAdminFromRequest(request);
    const students = getAllStudentsWithUser();
    return NextResponse.json(students);
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status ?? 500;
    return handleApiError(error, 'admin/students GET', 'Öğrenci listesi alınamadı', status);
  }
}

export async function POST(request: NextRequest) {
  try {
    getAdminFromRequest(request);
    const body = await request.json();
    const { name, email, password, student_number, department, phone } = body;
    if (!name || !email || !password || !student_number) {
      return NextResponse.json(
        { error: 'Ad, email, şifre ve öğrenci numarası gereklidir' },
        { status: 400 }
      );
    }
    const user = await registerUser({
      name,
      email,
      password,
      studentNumber: student_number,
      department: department ?? undefined,
      phone: phone ?? undefined,
    });
    return NextResponse.json({ message: 'Öğrenci oluşturuldu', user }, { status: 201 });
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status ?? 500;
    return handleApiError(error, 'admin/students POST', 'Öğrenci oluşturulamadı', status);
  }
}
