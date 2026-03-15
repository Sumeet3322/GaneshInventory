import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    await connectToDatabase();
    
    // Recalculate remaining if total changes
    if (body.totalQuantity !== undefined && body.usedQuantity !== undefined) {
       body.remainingQuantity = body.totalQuantity - body.usedQuantity;
    } else if (body.totalQuantity !== undefined) {
       const curr = await Ingredient.findById(id);
       body.remainingQuantity = body.totalQuantity - curr.usedQuantity;
    }

    const ingredient = await Ingredient.findByIdAndUpdate(id, body, { new: true });
    if (!ingredient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ingredient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();
    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ingredient' }, { status: 500 });
  }
}
