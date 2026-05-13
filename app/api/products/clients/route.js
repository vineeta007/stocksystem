import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'Data_Base_Maintenance_2026.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets['Data Garansi'];
    const data = XLSX.utils.sheet_to_json(sheet);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}