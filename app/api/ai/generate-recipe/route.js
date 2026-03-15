import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';

// Initialize the Google Gen AI SDK
// The SDK automatically picks up the GEMINI_API_KEY from the environment
const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch available ingredients from the database to give context to the AI
    const availableIngredients = await Ingredient.find({}, 'name unit');
    
    if (availableIngredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients found in the inventory to generate a recipe from.' }, { status: 400 });
    }

    const ingredientsContext = availableIngredients.map(ing => `- ${ing.name} (Unit: ${ing.unit})`).join('\n');

    const systemInstruction = `
You are a master chef assistant building recipes for an inventory management system.
You MUST generate a recipe based on the user's prompt, using ONLY the ingredients provided in the available inventory list.
Available Inventory:
${ingredientsContext}

Instructions:
1. Create a logical recipe based on the prompt.
2. Select ingredients ONLY from the 'Available Inventory' list. 
3. Estimate reasonable 'quantityPerMeal' values based on the ingredient's unit.
4. Return the response EXCLUSIVELY in valid JSON format, matching exactly this structure:
{
  "name": "Recipe Name",
  "description": "Short description of the dish",
  "ingredients": [
    {
      "name": "Exact Name from Inventory",
      "quantityPerMeal": 100,
      "unit": "Exact Unit from Inventory"
    }
  ]
}
Do NOT include any markdown formatting like \`\`\`json or \`\`\`. Output ONLY the raw JSON object.
    `;

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const outputText = response.text;
    
    // Attempt to parse the text as JSON
    let recipeData;
    try {
      recipeData = JSON.parse(outputText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON:", outputText);
      return NextResponse.json({ error: 'Failed to generate a valid recipe. Please try again.' }, { status: 500 });
    }

    // Map the generated ingredients back to their Database IDs
    const finalIngredients = recipeData.ingredients.map(generatedIng => {
      const dbIng = availableIngredients.find(i => i.name.toLowerCase() === generatedIng.name.toLowerCase());
      if (!dbIng) return null;
      return {
        ingredientId: dbIng._id,
        name: dbIng.name,
        quantityPerMeal: generatedIng.quantityPerMeal,
        unit: dbIng.unit
      };
    }).filter(ing => ing !== null); // Remove any ingredients the AI hallucinated

    recipeData.ingredients = finalIngredients;

    return NextResponse.json(recipeData);

  } catch (error) {
    console.error('AI Strategy Error:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}
