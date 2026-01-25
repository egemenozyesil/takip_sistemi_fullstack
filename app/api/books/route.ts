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

    let query = 'SELECT * FROM book_reading WHERE student_id = ?';
    const params: any[] = [studentId];

    if (startDate && endDate) {
      query += ' AND reading_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY reading_date DESC';

    const books = db.prepare(query).all(...params);

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
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

    const { book_title, pages_read, reading_date, notes } = await request.json();

    if (!book_title || !reading_date) {
      return NextResponse.json({ error: 'Book title and reading date are required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO book_reading (id, student_id, book_title, pages_read, reading_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, studentId, book_title, pages_read || 0, reading_date, notes || null);

    const book = db.prepare('SELECT * FROM book_reading WHERE id = ?').get(id);

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book reading:', error);
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
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const db = getDb();
    
    // Verify ownership
    const book = db.prepare('SELECT * FROM book_reading WHERE id = ? AND student_id = ?').get(id, studentId);
    
    if (!book) {
      return NextResponse.json({ error: 'Book reading not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM book_reading WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book reading:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
