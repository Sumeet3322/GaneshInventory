import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';
import Recipe from '@/models/Recipe';

const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    const { message, previousMessages = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch available inventory and recipes for context
    const ingredients = await Ingredient.find({}, 'name remainingQuantity unit');
    const recipes = await Recipe.find({}, 'name description');

    const inventoryContext = ingredients.map(ing => `- ${ing.name}: ${ing.remainingQuantity} ${ing.unit}`).join('\n');
    const recipesContext = recipes.map(r => `- ${r.name}: ${r.description}`).join('\n');

    const systemInstruction = `
You are Chef AI, an expert, friendly, and helpful culinary assistant integrated into a kitchen inventory app.
You know exactly what the user has in their kitchen right now and what recipes they have saved.

CURRENT INVENTORY:
${inventoryContext || "The inventory is currently empty."}

SAVED RECIPES:
${recipesContext || "No recipes have been saved yet."}

Instructions:
1. Answer the user's kitchen, cooking, or inventory-related questions.
2. Provide short, concise, and highly practical answers. Wait for follow up questions rather than giving too much information at once.
3. If they ask what they can cook, look at both the SAVED RECIPES and their CURRENT INVENTORY to make realistic suggestions based *only* on what they actually have in stock.
4. If they ask for ingredient substitutions (e.g., "I don't have butter"), suggest alternatives and check if they have those alternatives in their CURRENT INVENTORY.
5. Have a warm, encouraging "chef" persona.
    `;

    // Construct history for Gemini
    const history = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history
    });

    const response = await chat.sendMessage({ message });

    return NextResponse.json({ reply: response.text });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
