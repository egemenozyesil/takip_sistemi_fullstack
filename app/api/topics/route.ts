import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const lessonId = searchParams.get('lesson_id');

    let results;
    if (lessonId) {
      results = db
        .prepare(`
          SELECT 
            t.*,
            l.name as lesson_name
          FROM topics t
          JOIN lessons l ON t.lesson_id = l.id
          WHERE t.lesson_id = ?
          ORDER BY l.name, t.unit, t.topic
        `)
        .all(lessonId);
    } else {
      results = db
        .prepare(`
          SELECT 
            t.*,
            l.name as lesson_name
          FROM topics t
          JOIN lessons l ON t.lesson_id = l.id
          ORDER BY l.name, t.unit, t.topic
        `)
        .all();
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
