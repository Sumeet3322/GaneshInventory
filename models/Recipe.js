import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ingredients: [
    {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
      name: { type: String, required: true },
      quantityPerMeal: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);
