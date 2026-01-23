import getDb from '@/app/lib/db';

export interface StudentData {
  id: string;
  user_id: string;
  student_number: string;
  department: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  updated_at: string;
}

export function getStudentByUserId(userId: string): StudentData | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId) as StudentData | undefined;
}

export function getAllStudents(): StudentData[] {
  const db = getDb();
  return db.prepare('SELECT * FROM students').all() as StudentData[];
}

export function addAttendance(studentId: string, status: 'present' | 'absent' = 'present') {
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  
  db.prepare(`
    INSERT INTO attendance (id, student_id, status)
    VALUES (?, ?, ?)
  `).run(uuidv4(), studentId, status);
}

export function getStudentAttendance(studentId: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC').all(studentId);
}
