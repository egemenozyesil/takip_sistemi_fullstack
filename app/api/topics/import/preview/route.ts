import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { handleApiError } from '@/app/lib/apiError';
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
    const previewData: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      // Expected format: Ders | Ünite | Konu | MEB Kazanımı | Alt Kazanımlar | Soru Tipleri
      if (!row[0] || !row[2]) {
        errors.push(`Satır ${index + 2}: Ders veya Konu eksik`);
        return;
      }

      previewData.push({
        row: index + 2,
        ders: String(row[0]).trim(),
        unite: row[1] ? String(row[1]).trim() : '',
        konu: String(row[2]).trim(),
        meb_kazanim: row[3] ? String(row[3]).trim() : '',
        alt_kazanimlar: row[4] ? String(row[4]).trim() : '',
        soru_tipleri: row[5] ? String(row[5]).trim() : '',
      });
    });

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      validRows: previewData.length,
      errors: errors.length,
      errorMessages: errors,
      preview: previewData.slice(0, 50), // Show first 50 rows in preview
      hasMore: previewData.length > 50,
    });
  } catch (error) {
    return handleApiError(error, 'topics/import/preview POST', 'Internal server error', 500);
  }
}
