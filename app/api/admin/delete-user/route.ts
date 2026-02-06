import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/app/lib/db';
import { verifyPassword } from '@/app/lib/auth';
import type { User } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const students = db.prepare('SELECT id FROM students WHERE user_id = ?').all(userId) as { id: string }[];

    db.pragma('foreign_keys = OFF');

    try {
      for (const student of students) {
        db.prepare('DELETE FROM attendance WHERE student_id = ?').run(student.id);
        db.prepare('DELETE FROM daily_stats WHERE student_id = ?').run(student.id);
        db.prepare('DELETE FROM book_reading WHERE student_id = ?').run(student.id);
        db.prepare('DELETE FROM going_out WHERE student_id = ?').run(student.id);
        db.prepare('DELETE FROM game_sessions WHERE student_id = ?').run(student.id);
        db.prepare('DELETE FROM students WHERE id = ?').run(student.id);
      }

      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      db.pragma('foreign_keys = ON');

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı ve tüm ilişkili veriler silindi'
      });
    } finally {
      db.pragma('foreign_keys = ON');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
