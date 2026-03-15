import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    const { ingredientName } = await req.json();

    if (!ingredientName) {
      return NextResponse.json({ error: 'Ingredient name is required' }, { status: 400 });
    }

    const systemInstruction = `
You are a smart kitchen inventory assistant. 
Given an ingredient name, you need to predict the most logical 'unit' of measurement and a sensible 'lowStockThreshold'.

Rules:
1. 'unit' MUST be one of: 'g', 'ml', 'pieces', or 'kg'. Only use these four strings.
   - Example: "Eggs" -> "pieces"
   - Example: "Milk" -> "ml"
   - Example: "Salt" -> "g"
   - Example: "Flour" -> "kg" (or 'g' if typically bought in small amounts)
2. 'lowStockThreshold' MUST be a sensible number. 
   - Example: 5 for "pieces" of eggs.
   - Example: 500 for "ml" of milk.
   - Example: 100 for "g" of salt.
3. Return ONLY a valid JSON object matching this structure exactly:
{
  "unit": "string",
  "lowStockThreshold": number
}
Do not use markdown blocks like \`\`\`json. Return the raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: ingredientName,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more deterministic/standard predictions
      }
    });

    const outputText = response.text;
    
    let prediction;
    try {
      prediction = JSON.parse(outputText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON:", outputText);
      return NextResponse.json({ error: 'Failed to predict standard units.' }, { status: 500 });
    }

    // fallback validation
    if (!['g', 'ml', 'pieces', 'kg'].includes(prediction.unit)) {
        prediction.unit = 'g'; // default fallback
    }

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('AI Predictor Error:', error);
    return NextResponse.json({ error: 'Failed to predict ingredient properties' }, { status: 500 });
  }
}
