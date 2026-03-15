"use client";

import { useState, useEffect } from "react";
import { ChefHat, AlertCircle, Lightbulb, Loader2 } from "lucide-react";

export default function CookForm({ recipes, onCook }) {
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [meals, setMeals] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // AI Substitution states
  const [subLoading, setSubLoading] = useState({});
  const [subSuggestions, setSubSuggestions] = useState({});

  const selectedRecipeData = recipes.find(r => r._id === selectedRecipe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe || meals < 1) return;
    
    setError("");
    setLoading(true);
    try {
      await onCook(selectedRecipe, meals);
    } catch (err) {
      setError(err.message || "Failed to cook meal.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskSubstitution = async (ingredientName, requiredQuantity, unit) => {
    setSubLoading(prev => ({ ...prev, [ingredientName]: true }));
    try {
      const res = await fetch('/api/ai/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName, requiredQuantity, unit })
      });
      const data = await res.json();
      if (data.suggestion) {
        setSubSuggestions(prev => ({ ...prev, [ingredientName]: data.suggestion }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubLoading(prev => ({ ...prev, [ingredientName]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ChefHat className="text-blue-600" /> Start Cooking
      </h2>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Recipe</label>
          <select
            required
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
          >
            <option value="">-- Select a Recipe --</option>
            {recipes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Meals</label>
          <input
            type="number"
            min="1"
            required
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
            value={meals}
            onChange={(e) => setMeals(parseInt(e.target.value) || 1)}
          />
        </div>

        {selectedRecipeData && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Estimated Ingredients Deducted:</h4>
            <ul className="space-y-3">
              {selectedRecipeData.ingredients.map((ing, idx) => (
                <li key={idx} className="border-b border-blue-100 pb-2">
                  <div className="flex justify-between items-center text-sm text-blue-800">
                    <span>{ing.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{ing.quantityPerMeal * meals} {ing.unit}</span>
                      <button
                        type="button"
                        onClick={() => handleAskSubstitution(ing.name, ing.quantityPerMeal * meals, ing.unit)}
                        disabled={subLoading[ing.name]}
                        title="Ask AI for Substitution"
                        className="text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
                      >
                        {subLoading[ing.name] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {subSuggestions[ing.name] && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900 flex gap-2 items-start">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>{subSuggestions[ing.name]}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedRecipe}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Cook Now"}
        </button>
      </form>
    </div>
  );
}
