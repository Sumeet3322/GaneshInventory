import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';
import Recipe from '@/models/Recipe';

const ai = new GoogleGenAI({});

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch available inventory
    const ingredients = await Ingredient.find({ remainingQuantity: { $gt: 0 } }, 'name remainingQuantity unit');
    
    if (ingredients.length === 0) {
       return NextResponse.json({ recommendations: [] });
    }

    // Fetch saved recipes
    const recipes = await Recipe.find({}, 'name description ingredients');

    const inventoryContext = ingredients.map(ing => `- ${ing.name}: ${ing.remainingQuantity} ${ing.unit}`).join('\n');
    const recipesContext = recipes.map(r => {
      const parts = r.ingredients.map(i => `${i.quantityPerMeal} ${i.unit} of ${i.name}`).join(', ');
      return `- ${r.name} (Requires: ${parts})`;
    }).join('\n');

    const systemInstruction = `
You are an intelligent culinary AI for an inventory app.
Your job is to recommend 1-3 meals the user can cook RIGHT NOW based on their available inventory.

AVAILABLE INVENTORY:
${inventoryContext}

SAVED RECIPES:
${recipesContext || "No recipes saved yet."}

Instructions:
1. Analyze the 'AVAILABLE INVENTORY'.
2. If there are 'SAVED RECIPES' that can be cooked entirely with the current inventory, recommend them!
3. If they don't have enough for saved recipes, invent 1 or 2 new, simple, creative meals they can make using ONLY what they currently have.
4. Keep the descriptions short and appetizing (1 sentence max per recommendation).
5. Output ONLY a valid JSON array of objects with \`name\` and \`description\` properties.
Example:
[
  { "name": "Tomato & Egg Scramble", "description": "A quick protein-packed breakfast using your fresh eggs and tomatoes." },
  { "name": "Basic Pancakes", "description": "Fluffy homemade pancakes requiring just flour, milk, and eggs." }
]
Do not include markdown blocks like \`\`\`json. Return the raw JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: "What can I cook?",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      }
    });

    const outputText = response.text;
    
    let recommendations = [];
    try {
      recommendations = JSON.parse(outputText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON:", outputText);
      return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
    }

    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
