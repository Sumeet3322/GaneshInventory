"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Wand2, Loader2 } from "lucide-react";

export default function NewRecipePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  
  const [recipeIngredients, setRecipeIngredients] = useState([
    { ingredientId: "", quantityPerMeal: "" }
  ]);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/ingredients")
      .then(res => res.json())
      .then(data => setIngredients(data))
      .catch(console.error);
  }, []);

  const handleAddIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: "", quantityPerMeal: "" }]);
  };

  const handleRemoveIngredient = (index) => {
    const updated = recipeIngredients.filter((_, i) => i !== index);
    setRecipeIngredients(updated);
  };

  const handleChangeIngredient = (index, field, value) => {
    const updated = [...recipeIngredients];
    updated[index][field] = value;
    setRecipeIngredients(updated);
  };

  const handleGenerateRecipe = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      
      if (res.ok && data.ingredients && data.ingredients.length > 0) {
        setRecipeName(data.name || "");
        setRecipeDesc(data.description || "");
        
        // Map the generated ingredients into our form state structure
        const formattedIngredients = data.ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantityPerMeal: ing.quantityPerMeal.toString()
        }));
        setRecipeIngredients(formattedIngredients);
        setAiPrompt("");
      } else {
        alert(data.error || "Could not generate recipe. Please try again or ensure your pantry has enough variety.");
      }
    } catch (error) {
      console.error("AI Generation Error: ", error);
      alert("Something went wrong with the AI Generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedIngredients = recipeIngredients.map(ri => {
      const ing = ingredients.find(i => i._id === ri.ingredientId);
      return {
        ingredientId: ri.ingredientId,
        name: ing?.name,
        quantityPerMeal: parseFloat(ri.quantityPerMeal),
        unit: ing?.unit
      };
    });

    try {
      await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipeName,
          description: recipeDesc,
          ingredients: formattedIngredients
        })
      });
      router.push("/recipes");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Recipe</h1>
        <p className="mt-1 text-sm text-gray-500">Build a structured recipe to automate inventory tracking.</p>
      </div>
      
      {/* Magic Recipe Generator Section */}
      <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-50 text-indigo-600 shrink-0">
            <Wand2 size={24} />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-indigo-950 mb-1">Magic Recipe Generator</h2>
            <p className="text-sm text-indigo-700 mb-4">
              Describe what you want to cook! AI will automatically build a recipe using only the ingredients you currently have in your kitchen.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. A spicy tomato soup with lots of onions"
                className="flex-grow border-indigo-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGenerateRecipe())}
              />
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !aiPrompt}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Thinking...</> : "Generate"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
            <input
              type="text"
              required
              className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g. Masala Dosa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50 h-24"
              value={recipeDesc}
              onChange={(e) => setRecipeDesc(e.target.value)}
              placeholder="Brief description of the recipe..."
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients Required per Meal</h3>
          
          <div className="space-y-4 mb-6">
            {recipeIngredients.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex-grow">
                  <select
                    required
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
                    value={item.ingredientId}
                    onChange={(e) => handleChangeIngredient(idx, "ingredientId", e.target.value)}
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map(ing => (
                      <option key={ing._id} value={ing._id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Quantity"
                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
                    value={item.quantityPerMeal}
                    onChange={(e) => handleChangeIngredient(idx, "quantityPerMeal", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  disabled={recipeIngredients.length === 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddIngredient}
            className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Another Ingredient
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : <><Save size={18} /> Save Recipe</>}
          </button>
        </div>
      </form>
    </div>
  );
}
