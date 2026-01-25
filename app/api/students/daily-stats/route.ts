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

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const todayOnly = searchParams.get('today') === 'true';

    // If today only, return just today's stats
    if (todayOnly) {
      const today = new Date().toISOString().split('T')[0];
      const stats = db
        .prepare('SELECT * FROM daily_stats WHERE student_id = ? AND date = ?')
        .get(studentId, today);

      if (!stats) {
      return NextResponse.json({
        id: null,
        student_id: studentId,
        date: today,
        topic_id: null,
        work_minutes: 0,
        questions_answered: 0,
        soru_tipleri: null,
        notes: null,
      });
      }

      return NextResponse.json(stats);
    }

    // Get all stats with optional date filtering, join with topics and lessons
    // Only from daily_stats table
    let query = `
      SELECT 
        ds.date,
        ds.topic_id,
        COALESCE(SUM(ds.work_minutes), 0) as work_minutes,
        COALESCE(SUM(ds.questions_answered), 0) as questions_answered,
        MAX(t.topic) as topic,
        MAX(t.unit) as unit,
        MAX(ds.soru_tipleri) as soru_tipleri,
        MAX(ds.notes) as notes,
        MAX(l.name) as lesson_name
      FROM daily_stats ds
      LEFT JOIN topics t ON ds.topic_id = t.id
      LEFT JOIN lessons l ON t.lesson_id = l.id
      WHERE ds.student_id = ?
    `;
    const params: any[] = [studentId];

    if (startDate && endDate) {
      query += ' AND ds.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY ds.date ORDER BY ds.date DESC';

    const stats = db.prepare(query).all(...params);

    // Get unique topics count for this student
    const uniqueTopicsQuery = `
      SELECT COUNT(DISTINCT topic_id) as unique_topics
      FROM daily_stats
      WHERE student_id = ? AND topic_id IS NOT NULL
    `;
    const uniqueTopicsParams: any[] = [studentId];
    if (startDate && endDate) {
      const uniqueTopicsQueryWithDate = `
        SELECT COUNT(DISTINCT topic_id) as unique_topics
        FROM daily_stats
        WHERE student_id = ? AND topic_id IS NOT NULL AND date BETWEEN ? AND ?
      `;
      const uniqueTopicsResult = db.prepare(uniqueTopicsQueryWithDate).get(studentId, startDate, endDate) as any;
      return NextResponse.json({
        stats,
        uniqueTopics: uniqueTopicsResult?.unique_topics || 0
      });
    }

    const uniqueTopicsResult = db.prepare(uniqueTopicsQuery).get(...uniqueTopicsParams) as any;

    return NextResponse.json({
      stats,
      uniqueTopics: uniqueTopicsResult?.unique_topics || 0
    });
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

    const { topic_id, work_minutes, questions_answered, soru_tipleri, date, notes } = await request.json();

    if (!topic_id) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Get student id from user id
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = (student as any).id;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if record exists for the target date
    const existing = db
      .prepare('SELECT id FROM daily_stats WHERE student_id = ? AND date = ?')
      .get(studentId, targetDate);

    let result;

    // Verify topic exists
    const topic = db.prepare('SELECT id FROM topics WHERE id = ?').get(topic_id);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (existing) {
      // Update existing record
      db.prepare(
        `UPDATE daily_stats 
         SET topic_id = ?, work_minutes = ?, questions_answered = ?, soru_tipleri = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE student_id = ? AND date = ?`
      ).run(topic_id, work_minutes || 0, questions_answered || 0, soru_tipleri || null, notes || null, studentId, targetDate);

      result = {
        id: (existing as any).id,
        student_id: studentId,
        date: targetDate,
        topic_id,
        work_minutes: work_minutes || 0,
        questions_answered: questions_answered || 0,
        soru_tipleri: soru_tipleri || null,
        notes: notes || null,
      };
    } else {
      // Create new record
      const id = uuidv4();
      db.prepare(
        `INSERT INTO daily_stats (id, student_id, date, topic_id, work_minutes, questions_answered, soru_tipleri, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, studentId, targetDate, topic_id, work_minutes || 0, questions_answered || 0, soru_tipleri || null, notes || null);

      result = {
        id,
        student_id: studentId,
        date: targetDate,
        topic_id,
        work_minutes: work_minutes || 0,
        questions_answered: questions_answered || 0,
        soru_tipleri: soru_tipleri || null,
        notes: notes || null,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving daily stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Get student id from user id
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentId = (student as any).id;

    // Verify ownership
    const record = db.prepare('SELECT * FROM daily_stats WHERE id = ? AND student_id = ?').get(id, studentId);

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM daily_stats WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
