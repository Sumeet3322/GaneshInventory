import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CookingLog from '@/models/CookingLog';

export async function GET() {
  try {
    await connectToDatabase();
    const logs = await CookingLog.find({}).sort({ date: -1 });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
