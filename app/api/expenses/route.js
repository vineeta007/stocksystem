import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json({ success: true, data: expenses });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const expense = await Expense.create({
      date: body.date,
      name: body.name,
      amount: Number(body.amount) || 0,
      details: body.details || '',
    });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}