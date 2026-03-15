import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalQuantity: { type: Number, required: true, default: 0 },
  usedQuantity: { type: Number, required: true, default: 0 },
  remainingQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  lowStockThreshold: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
