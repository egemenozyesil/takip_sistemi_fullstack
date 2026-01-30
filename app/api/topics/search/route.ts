import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { handleApiError } from '@/app/lib/apiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const db = getDb();

    const results = db
      .prepare(`
        SELECT 
          t.id,
          t.topic,
          t.unit,
          l.name as lesson_name
        FROM topics t
        JOIN lessons l ON t.lesson_id = l.id
        WHERE t.topic LIKE ? OR l.name LIKE ? OR t.unit LIKE ?
        LIMIT 20
      `)
      .all(`%${query}%`, `%${query}%`, `%${query}%`);

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error, 'topics/search GET', 'Internal server error', 500);
  }
}
