import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

export async function POST() {
  try {
    await connectToDatabase();
    
    // Fetch all ingredients and reset their used/remaining quantities
    const ingredients = await Ingredient.find({});
    for (const ingredient of ingredients) {
      ingredient.usedQuantity = 0;
      ingredient.remainingQuantity = ingredient.totalQuantity;
      await ingredient.save();
    }
    
    return NextResponse.json({ message: 'All ingredients restocked successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to restock ingredients' }, { status: 500 });
  }
}
