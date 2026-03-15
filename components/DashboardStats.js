"use client";

import { Box, PackageOpen, AlertTriangle, Utensils } from "lucide-react";

export default function DashboardStats({ stats }) {
  const cards = [
    {
      title: "Total Ingredients",
      value: stats.totalIngredients || 0,
      icon: Box,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockCount || 0,
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600",
    },
    {
      title: "Total Recipes",
      value: stats.totalRecipes || 0,
      icon: Utensils,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Meals Cooked (Week)",
      value: stats.mealsCookedWeek || 0,
      icon: PackageOpen,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
