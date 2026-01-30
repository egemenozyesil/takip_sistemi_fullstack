import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { handleApiError } from '@/app/lib/apiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { phone, department, bio, avatar } = await request.json();

    const db = getDb();

    // Get student id from user id
    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = (student as any).id;

    // Update student profile
    db.prepare(
      `UPDATE students 
       SET phone = ?, department = ?, bio = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(phone, department, bio, avatar, studentId);

    // Get updated student data
    const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);

    return NextResponse.json(updatedStudent);
  } catch (error) {
    return handleApiError(error, 'students/update-profile PUT', 'Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const db = getDb();

    // Get user and student data
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId);

    if (!user || !student) {
      return NextResponse.json({ error: 'User or student not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      ...student,
    });
  } catch (error) {
    return handleApiError(error, 'students/update-profile GET', 'Internal server error', 500);
  }
}
