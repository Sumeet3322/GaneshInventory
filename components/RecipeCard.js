"use client";

import { Utensils, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RecipeCard({ recipe }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{recipe.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {recipe.description || "No description provided."}
          </p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Utensils size={24} />
        </div>
      </div>
      
      <div className="flex-grow mt-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Ingredients ({recipe.ingredients.length})
        </h4>
        <ul className="space-y-2">
          {recipe.ingredients.slice(0, 3).map((ing, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex justify-between border-b border-gray-50 pb-1">
              <span>{ing.name}</span>
              <span className="font-medium">
                {ing.quantityPerMeal} {ing.unit}
              </span>
            </li>
          ))}
          {recipe.ingredients.length > 3 && (
            <li className="text-sm text-gray-400 italic">
              + {recipe.ingredients.length - 3} more ingredients
            </li>
          )}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={14} /> {new Date(recipe.createdAt).toLocaleDateString()}
        </span>
        <Link 
          href={`/cook?recipeId=${recipe._id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Cook This <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
