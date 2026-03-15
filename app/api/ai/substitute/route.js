import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    const { ingredientName, requiredQuantity, unit } = await req.json();

    if (!ingredientName) {
      return NextResponse.json({ error: 'Missing ingredient information' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch available inventory to ground the AI's suggestions
    const ingredients = await Ingredient.find({ remainingQuantity: { $gt: 0 } }, 'name remainingQuantity unit');
    
    const inventoryContext = ingredients.map(ing => `- ${ing.name}: ${ing.remainingQuantity} ${ing.unit}`).join('\n');

    const systemInstruction = `
You are an expert chef assistant helping a user who is trying to cook a meal but is currently SHORT on a specific ingredient.
They need a substitution for: ${requiredQuantity} ${unit} of ${ingredientName}.

AVAILABLE INVENTORY (They ONLY have these ingredients in their kitchen right now):
${inventoryContext || "The inventory is entirely empty."}

Instructions:
1. Look at their AVAILABLE INVENTORY.
2. Suggest 1 or 2 logical substitutions for '${ingredientName}' using ONLY items they currently have in stock.
3. If they have NOTHING in their inventory that works as a substitute, honestly tell them that they will need to go to the store, but suggest what they *would* need.
4. Keep the response very concise, friendly, and directly helpful. (Max 2 sentences).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `I need a substitute for ${ingredientName}. What can I use from my inventory?`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, 
      }
    });

    return NextResponse.json({ suggestion: response.text });

  } catch (error) {
    console.error('AI Substitution Error:', error);
    return NextResponse.json({ error: 'Failed to fetch substitution' }, { status: 500 });
  }
}
