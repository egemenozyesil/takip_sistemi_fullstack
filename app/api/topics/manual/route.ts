import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const { ders, unite, konu, meb_kazanim, alt_kazanimlar, soru_tipleri } = await request.json();

    if (!ders || !konu) {
      return NextResponse.json(
        { error: 'Ders ve Konu alanları zorunludur' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Get or create lesson
    const getLesson = db.prepare('SELECT id FROM lessons WHERE name = ?');
    let lesson = getLesson.get(ders.trim()) as any;
    
    if (!lesson) {
      const lessonId = uuidv4();
      const insertLesson = db.prepare('INSERT INTO lessons (id, name) VALUES (?, ?)');
      insertLesson.run(lessonId, ders.trim());
      lesson = { id: lessonId };
    }

    // Insert topic
    const topicId = uuidv4();
    const insertTopic = db.prepare(`
      INSERT INTO topics (id, lesson_id, unit, topic, meb_kazanim, alt_kazanimlar, soru_tipleri)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      insertTopic.run(
        topicId,
        lesson.id,
        unite?.trim() || null,
        konu.trim(),
        meb_kazanim?.trim() || null,
        alt_kazanimlar?.trim() || null,
        soru_tipleri?.trim() || null
      );

      // Get the created topic with lesson name
      const createdTopic = db
        .prepare(`
          SELECT 
            t.*,
            l.name as lesson_name
          FROM topics t
          JOIN lessons l ON t.lesson_id = l.id
          WHERE t.id = ?
        `)
        .get(topicId);

      return NextResponse.json({
        success: true,
        message: 'Konu başarıyla eklendi',
        topic: createdTopic
      }, { status: 201 });
    } catch (error: any) {
      console.error('Error inserting topic:', error);
      return NextResponse.json(
        { error: 'Konu eklenirken hata oluştu: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error adding topic manually:', error);
    if (error.message === 'Unauthorized' || error.message.includes('jwt')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
