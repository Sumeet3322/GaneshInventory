import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import CookingLog from '@/models/CookingLog';

export async function POST(req) {
  try {
    const { recipeId, meals } = await req.json();
    
    if (!recipeId || !meals || meals <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await connectToDatabase();
    
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Prepare updates and check inventory
    const usedIngredientsData = [];
    const ingredientUpdates = [];

    for (const item of recipe.ingredients) {
      const ingredient = await Ingredient.findById(item.ingredientId);
      if (!ingredient) {
        return NextResponse.json({ error: `Ingredient ${item.name} not found in inventory` }, { status: 400 });
      }

      const totalRequired = item.quantityPerMeal * meals;
      
      if (ingredient.remainingQuantity < totalRequired) {
        return NextResponse.json({ 
          error: `Not enough ${item.name}. Required: ${totalRequired} ${item.unit}, Available: ${ingredient.remainingQuantity} ${ingredient.unit}` 
        }, { status: 400 });
      }

      usedIngredientsData.push({
        ingredientId: item.ingredientId,
        name: item.name,
        quantityUsed: totalRequired,
        unit: item.unit
      });

      ingredientUpdates.push({
        ingredient,
        totalRequired
      });
    }

    // If we reach here, we have enough inventory.
    // Let's deduct the inventory
    for (const update of ingredientUpdates) {
      update.ingredient.usedQuantity += update.totalRequired;
      update.ingredient.remainingQuantity -= update.totalRequired;
      await update.ingredient.save();
    }

    // Save cooking log
    const log = new CookingLog({
      recipeId: recipe._id,
      recipeName: recipe.name,
      mealsCooked: meals,
      ingredientsUsed: usedIngredientsData
    });
    
    await log.save();

    return NextResponse.json({ message: 'Validation and deduction successful', log }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Cooking process failed' }, { status: 500 });
  }
}
