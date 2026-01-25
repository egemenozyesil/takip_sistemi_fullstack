import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function getStudentId(userId: string): string | null {
  const db = getDb();
  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId) as any;
  return student?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const studentId = getStudentId(decoded.id);

    if (!studentId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const db = getDb();

    // Get all topics with their progress from daily_stats
    const query = `
      SELECT 
        t.id,
        t.topic,
        t.unit,
        t.lesson_id,
        l.name as lesson_name,
        COALESCE(SUM(ds.work_minutes) / 60.0, 0) as total_study_hours,
        COALESCE(SUM(ds.questions_answered), 0) as total_questions_solved,
        COUNT(DISTINCT ds.date) as study_days,
        MAX(ds.date) as last_study_date,
        MIN(ds.date) as first_study_date
      FROM topics t
      JOIN lessons l ON t.lesson_id = l.id
      LEFT JOIN daily_stats ds ON t.id = ds.topic_id AND ds.student_id = ? AND ds.topic_id IS NOT NULL
      GROUP BY t.id, t.topic, t.unit, t.lesson_id, l.name
      ORDER BY l.name, t.unit, t.topic
    `;

    const topics = db.prepare(query).all(studentId);

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
