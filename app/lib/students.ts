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

export interface StudentWithUser extends StudentData {
  user_name: string;
  user_email: string;
}

export function getStudentByUserId(userId: string): StudentData | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId) as StudentData | undefined;
}

export function getStudentById(id: string): StudentData | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id) as StudentData | undefined;
}

export function getAllStudents(): StudentData[] {
  const db = getDb();
  return db.prepare('SELECT * FROM students').all() as StudentData[];
}

export function getAllStudentsWithUser(): StudentWithUser[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.*, u.name AS user_name, u.email AS user_email
    FROM students s
    INNER JOIN users u ON s.user_id = u.id
    ORDER BY u.name
  `).all() as (StudentData & { user_name: string; user_email: string })[];
  return rows;
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

export interface UpdateStudentInput {
  student_number?: string;
  department?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
}

export function updateStudentById(id: string, input: UpdateStudentInput) {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (input.student_number !== undefined) {
    fields.push('student_number = ?');
    values.push(input.student_number);
  }
  if (input.department !== undefined) {
    fields.push('department = ?');
    values.push(input.department);
  }
  if (input.phone !== undefined) {
    fields.push('phone = ?');
    values.push(input.phone);
  }
  if (input.bio !== undefined) {
    fields.push('bio = ?');
    values.push(input.bio);
  }
  if (input.avatar !== undefined) {
    fields.push('avatar = ?');
    values.push(input.avatar);
  }
  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  db.prepare(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}
