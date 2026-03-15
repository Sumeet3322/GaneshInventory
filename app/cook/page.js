"use client";

import { useEffect, useState } from "react";
import CookForm from "@/components/CookForm";

export default function CookPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCook = async (recipeId, meals) => {
    setSuccessMsg("");
    const res = await fetch("/api/cook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, meals })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Execution failed");
    }
    setSuccessMsg(`Successfully cooked ${meals} meal(s). Ingredients have been deducted from your inventory.`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cook a Meal</h1>
        <p className="mt-1 text-sm text-gray-500">Log your actual cooking to keep inventory automatically up to date.</p>
      </div>

      {successMsg && (
        <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 border border-green-200">
          <div className="p-2 bg-green-100 rounded-full shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
          </div>
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse h-96 bg-gray-100 rounded-2xl w-full"></div>
      ) : (
        <CookForm recipes={recipes} onCook={handleCook} />
      )}
    </div>
  );
}
