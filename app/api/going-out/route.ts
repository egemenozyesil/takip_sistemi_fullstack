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

    let query = 'SELECT * FROM going_out WHERE student_id = ?';
    const params: any[] = [studentId];

    if (startDate && endDate) {
      query += ' AND out_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY out_date DESC';

    const records = db.prepare(query).all(...params);

    return NextResponse.json(records);
  } catch (error) {
    return handleApiError(error, 'going-out GET', 'Internal server error', 500);
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

    const { out_date, duration_hours, purpose, notes } = await request.json();

    if (!out_date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO going_out (id, student_id, out_date, duration_hours, purpose, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, studentId, out_date, duration_hours || 0, purpose || null, notes || null);

    const record = db.prepare('SELECT * FROM going_out WHERE id = ?').get(id);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'going-out POST', 'Internal server error', 500);
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
    
    // Verify ownership
    const record = db.prepare('SELECT * FROM going_out WHERE id = ? AND student_id = ?').get(id, studentId);
    
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM going_out WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'going-out DELETE', 'Internal server error', 500);
  }
}
