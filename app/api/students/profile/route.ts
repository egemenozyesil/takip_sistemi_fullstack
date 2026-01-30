import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getStudentByUserId, getAllStudents, getStudentAttendance } from '@/app/lib/students';
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
    const student = getStudentByUserId(decoded.id);

    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    const attendance = getStudentAttendance(student.id);

    return NextResponse.json({
      student,
      attendance,
      attendanceRate: calculateAttendanceRate(attendance)
    });
  } catch (error) {
    return handleApiError(error, 'students/profile GET', 'Hata oluştu', 400);
  }
}

function calculateAttendanceRate(attendance: any[]) {
  if (attendance.length === 0) return 0;
  const present = attendance.filter(a => a.status === 'present').length;
  return Math.round((present / attendance.length) * 100);
}
