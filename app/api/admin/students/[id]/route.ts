import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/app/lib/adminAuth';
import { getStudentById, updateStudentById } from '@/app/lib/students';
import { getUserById, updateUserNameAndEmail } from '@/app/lib/auth';
import { handleApiError } from '@/app/lib/apiError';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAdminFromRequest(request);
    const { id } = await params;
    const student = getStudentById(id);
    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
    }
    const body = await request.json();
    const {
      student_number,
      department,
      phone,
      bio,
      avatar,
      name,
      email,
    } = body;

    const studentUpdates: Parameters<typeof updateStudentById>[1] = {};
    if (student_number !== undefined) studentUpdates.student_number = student_number;
    if (department !== undefined) studentUpdates.department = department;
    if (phone !== undefined) studentUpdates.phone = phone;
    if (bio !== undefined) studentUpdates.bio = bio;
    if (avatar !== undefined) studentUpdates.avatar = avatar;
    if (Object.keys(studentUpdates).length > 0) {
      updateStudentById(id, studentUpdates);
    }

    if (name !== undefined || email !== undefined) {
      const user = getUserById(student.user_id) as { id: string; name: string; email: string } | undefined;
      if (user) {
        updateUserNameAndEmail(user.id, name ?? user.name, email ?? user.email);
      }
    }

    const updated = getStudentById(id);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status ?? 500;
    return handleApiError(error, 'admin/students/[id] PUT', 'Öğrenci güncellenemedi', status);
  }
}
