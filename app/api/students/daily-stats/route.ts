import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const db = getDb();

    // Get student id from user id
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = (student as any).id;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const stats = db
      .prepare('SELECT * FROM daily_stats WHERE student_id = ? AND date = ?')
      .get(studentId, today);

    if (!stats) {
      return NextResponse.json({
        id: null,
        student_id: studentId,
        date: today,
        work_hours: 0,
        questions_answered: 0,
        topics_studied: null,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { work_hours, questions_answered, topics_studied } = await request.json();

    const db = getDb();

    // Get student id from user id
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = (student as any).id;
    const today = new Date().toISOString().split('T')[0];

    // Check if record exists for today
    const existing = db
      .prepare('SELECT id FROM daily_stats WHERE student_id = ? AND date = ?')
      .get(studentId, today);

    let result;

    if (existing) {
      // Update existing record
      db.prepare(
        `UPDATE daily_stats 
         SET work_hours = ?, questions_answered = ?, topics_studied = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE student_id = ? AND date = ?`
      ).run(work_hours, questions_answered, topics_studied, studentId, today);

      result = {
        id: (existing as any).id,
        student_id: studentId,
        date: today,
        work_hours,
        questions_answered,
        topics_studied,
      };
    } else {
      // Create new record
      const id = uuidv4();
      db.prepare(
        `INSERT INTO daily_stats (id, student_id, date, work_hours, questions_answered, topics_studied) 
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(id, studentId, today, work_hours, questions_answered, topics_studied);

      result = {
        id,
        student_id: studentId,
        date: today,
        work_hours,
        questions_answered,
        topics_studied,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving daily stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
