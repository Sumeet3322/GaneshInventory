import mongoose from 'mongoose';

const CookingLogSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  recipeName: { type: String, required: true },
  mealsCooked: { type: Number, required: true },
  ingredientsUsed: [
    {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
      name: { type: String, required: true },
      quantityUsed: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  ],
  date: { type: Date, default: Date.now }
});

export default mongoose.models.CookingLog || mongoose.model('CookingLog', CookingLogSchema);
