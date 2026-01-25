import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (data.length < 2) {
      return NextResponse.json({ error: 'Excel file is empty or has no data rows' }, { status: 400 });
    }

    // Skip header row
    const rows = data.slice(1);

    const db = getDb();
    const insertLesson = db.prepare('INSERT OR IGNORE INTO lessons (id, name) VALUES (?, ?)');
    const getLesson = db.prepare('SELECT id FROM lessons WHERE name = ?');
    const insertTopic = db.prepare(`
      INSERT INTO topics (id, lesson_id, unit, topic, meb_kazanim, alt_kazanimlar, soru_tipleri)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      let imported = 0;
      let skipped = 0;

      for (const row of rows) {
        // Expected format: Ders | Ünite | Konu | MEB Kazanımı | Alt Kazanımlar | Soru Tipleri
        if (!row[0] || !row[2]) {
          // Skip rows without Ders or Konu
          skipped++;
          continue;
        }

        const lessonName = String(row[0]).trim();
        const unit = row[1] ? String(row[1]).trim() : null;
        const topic = String(row[2]).trim();
        const mebKazanim = row[3] ? String(row[3]).trim() : null;
        const altKazanimlar = row[4] ? String(row[4]).trim() : null;
        const soruTipleri = row[5] ? String(row[5]).trim() : null;

        // Get or create lesson
        let lesson = getLesson.get(lessonName) as any;
        if (!lesson) {
          const lessonId = uuidv4();
          insertLesson.run(lessonId, lessonName);
          lesson = { id: lessonId };
        }

        // Insert topic
        const topicId = uuidv4();
        try {
          insertTopic.run(
            topicId,
            lesson.id,
            unit,
            topic,
            mebKazanim,
            altKazanimlar,
            soruTipleri
          );
          imported++;
        } catch (error) {
          console.error('Error inserting topic:', error);
          skipped++;
        }
      }

      return { imported, skipped };
    });

    const result = transaction();

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      message: `${result.imported} konu başarıyla içe aktarıldı. ${result.skipped} satır atlandı.`
    });
  } catch (error: any) {
    console.error('Error importing topics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
