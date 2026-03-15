import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function GET() {
  try {
    await connectToDatabase();
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });
    return NextResponse.json(recipes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await connectToDatabase();
    const recipe = new Recipe(data);
    await recipe.save();
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
