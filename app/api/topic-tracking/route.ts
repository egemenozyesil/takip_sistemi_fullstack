import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { handleApiError } from '@/app/lib/apiError';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function getStudentId(userId: string) {
  const db = getDb();
  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId) as any;
  return student?.id;
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
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const topicId = searchParams.get('topic_id');

    // Get data from daily_stats table
    let query = `
      SELECT 
        ds.id,
        ds.student_id,
        ds.date as study_date,
        ds.topic_id,
        CAST(ds.work_minutes / 60.0 AS REAL) as study_hours,
        ds.questions_answered as questions_solved,
        ds.notes,
        ds.created_at,
        t.topic,
        t.unit,
        l.name as lesson_name
      FROM daily_stats ds
      LEFT JOIN topics t ON ds.topic_id = t.id
      LEFT JOIN lessons l ON t.lesson_id = l.id
      WHERE ds.student_id = ? AND ds.topic_id IS NOT NULL
    `;
    const params: any[] = [studentId];

    if (topicId) {
      query += ' AND ds.topic_id = ?';
      params.push(topicId);
    }

    if (startDate && endDate) {
      query += ' AND ds.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY ds.date DESC, ds.created_at DESC';

    const records = db.prepare(query).all(...params);

    return NextResponse.json(records);
  } catch (error) {
    return handleApiError(error, 'topic-tracking GET', 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
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

    const { topic_id, study_date, study_hours, questions_solved, notes } = await request.json();

    if (!topic_id || !study_date) {
      return NextResponse.json({ error: 'Topic ID and study date are required' }, { status: 400 });
    }

    // Verify topic exists
    const db = getDb();
    const topic = db.prepare('SELECT id FROM topics WHERE id = ?').get(topic_id);
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Convert study_hours to work_minutes (hours * 60 = minutes)
    const workMinutes = Math.round((study_hours || 0) * 60);
    const id = uuidv4();

    // Insert into daily_stats
    db.prepare(
      `INSERT INTO daily_stats (id, student_id, date, topic_id, work_minutes, questions_answered, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, studentId, study_date, topic_id, workMinutes, questions_solved || 0, notes || null);

    // Return the created record with topic and lesson info
    const record = db
      .prepare(`
        SELECT 
          ds.id,
          ds.student_id,
          ds.date as study_date,
          ds.topic_id,
          CAST(ds.work_minutes / 60.0 AS REAL) as study_hours,
          ds.questions_answered as questions_solved,
          ds.notes,
          ds.created_at,
          t.topic,
          t.unit,
          l.name as lesson_name
        FROM daily_stats ds
        LEFT JOIN topics t ON ds.topic_id = t.id
        LEFT JOIN lessons l ON t.lesson_id = l.id
        WHERE ds.id = ?
      `)
      .get(id);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'topic-tracking POST', 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const db = getDb();
    
    // Verify ownership and that it's a topic tracking record (has topic_id)
    const record = db.prepare('SELECT * FROM daily_stats WHERE id = ? AND student_id = ? AND topic_id IS NOT NULL').get(id, studentId);
    
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM daily_stats WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'topic-tracking DELETE', 'Internal server error', 500);
  }
}
