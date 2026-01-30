import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
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

    let query = 'SELECT * FROM game_sessions WHERE student_id = ?';
    const params: any[] = [studentId];

    if (startDate && endDate) {
      query += ' AND play_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY play_date DESC';

    const games = db.prepare(query).all(...params);

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
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
    const studentId = getStudentId(decoded.id);

    if (!studentId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const { game_name, duration_minutes, play_date, notes } = await request.json();

    if (!game_name || !play_date) {
      return NextResponse.json({ error: 'Game name and play date are required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO game_sessions (id, student_id, game_name, duration_minutes, play_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, studentId, game_name, duration_minutes || 0, play_date, notes || null);

    const game = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(id);

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game session:', error);
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
    const studentId = getStudentId(decoded.id);

    if (!studentId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Verify ownership
    const game = db.prepare('SELECT * FROM game_sessions WHERE id = ? AND student_id = ?').get(id, studentId);

    if (!game) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM game_sessions WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}