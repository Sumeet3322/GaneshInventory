export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

export async function GET() {
  try {
    await connectToDatabase();
    const ingredients = await Ingredient.find({}).sort({ createdAt: -1 });
    return NextResponse.json(ingredients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await connectToDatabase();
    // Calculate remainingQuantity which is equal to totalQuantity initially
    const ingredient = new Ingredient({
      ...data,
      usedQuantity: 0,
      remainingQuantity: data.totalQuantity
    });
    await ingredient.save();
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 });
  }
}
