import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Minimal schemas for seeding
const IngredientSchema = new mongoose.Schema({
  name: String,
  totalQuantity: Number,
  usedQuantity: { type: Number, default: 0 },
  remainingQuantity: Number,
  unit: String,
  lowStockThreshold: Number,
  createdAt: { type: Date, default: Date.now }
});

const RecipeSchema = new mongoose.Schema({
  name: String,
  description: String,
  ingredients: [{
    ingredientId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantityPerMeal: Number,
    unit: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('cluster0.mongodb.net')) {
    console.warn('⚠️ Please set a valid MONGODB_URI in .env.local before seeding.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data.');

    const ingredients = await Ingredient.insertMany([
      { name: 'Eggs', totalQuantity: 100, remainingQuantity: 100, unit: 'pieces', lowStockThreshold: 10 },
      { name: 'Oil', totalQuantity: 5000, remainingQuantity: 5000, unit: 'ml', lowStockThreshold: 500 },
      { name: 'Onion', totalQuantity: 2000, remainingQuantity: 2000, unit: 'g', lowStockThreshold: 200 },
      { name: 'Tomato', totalQuantity: 1500, remainingQuantity: 1500, unit: 'g', lowStockThreshold: 200 },
      { name: 'Salt', totalQuantity: 1000, remainingQuantity: 1000, unit: 'g', lowStockThreshold: 100 },
    ]);
    console.log('Seeded Ingredients.');

    const getIng = (name) => ingredients.find(i => i.name === name);

    await Recipe.create([
      {
        name: 'Omelette',
        description: 'A classic breakfast dish.',
        ingredients: [
          { ingredientId: getIng('Eggs')._id, name: 'Eggs', quantityPerMeal: 2, unit: 'pieces' },
          { ingredientId: getIng('Oil')._id, name: 'Oil', quantityPerMeal: 10, unit: 'ml' },
          { ingredientId: getIng('Onion')._id, name: 'Onion', quantityPerMeal: 20, unit: 'g' },
          { ingredientId: getIng('Salt')._id, name: 'Salt', quantityPerMeal: 2, unit: 'g' }
        ]
      },
      {
        name: 'Tomato Soup',
        description: 'Warm and comforting soup.',
        ingredients: [
          { ingredientId: getIng('Tomato')._id, name: 'Tomato', quantityPerMeal: 150, unit: 'g' },
          { ingredientId: getIng('Onion')._id, name: 'Onion', quantityPerMeal: 50, unit: 'g' },
          { ingredientId: getIng('Oil')._id, name: 'Oil', quantityPerMeal: 15, unit: 'ml' },
          { ingredientId: getIng('Salt')._id, name: 'Salt', quantityPerMeal: 3, unit: 'g' }
        ]
      }
    ]);
    console.log('Seeded Recipes.');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
