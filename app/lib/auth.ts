import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import getDb from './db';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  studentNumber?: string;
  department?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(input: RegisterInput) {
  const db = getDb();
  
  try {
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
    if (existing) {
      throw new Error('Bu email zaten kayıtlı');
    }

    const userId = uuidv4();
    const hashedPassword = await hashPassword(input.password);

    // Create user
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, input.email, hashedPassword, input.name, 'student');

    // Create student record
    if (input.studentNumber) {
      const studentId = uuidv4();
      db.prepare(`
        INSERT INTO students (id, user_id, student_number, department, phone)
        VALUES (?, ?, ?, ?, ?)
      `).run(studentId, userId, input.studentNumber, input.department || null, input.phone || null);
    }

    return { id: userId, email: input.email, name: input.name, role: 'student' };
  } catch (error) {
    throw error;
  }
}

export async function loginUser(input: LoginInput) {
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(input.email) as User | undefined;

    if (!user) {
      throw new Error('Email veya şifre yanlış');
    }

    const passwordValid = await verifyPassword(input.password, user.password);
    if (!passwordValid) {
      throw new Error('Email veya şifre yanlış');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    throw error;
  }
}

export function getUserById(id: string) {
  const db = getDb();
  return db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
}
