"use client";

import { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import { Sparkles, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalIngredients: 0,
    lowStockCount: 0,
    totalRecipes: 0,
    mealsCookedWeek: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ingredientsRes, recipesRes, logsRes] = await Promise.all([
          fetch('/api/ingredients').then(res => res.json()),
          fetch('/api/recipes').then(res => res.json()),
          fetch('/api/logs').then(res => res.json())
        ]);

        const lowStockItemsData = ingredientsRes
          .filter(i => i.remainingQuantity <= i.lowStockThreshold)
          .map(i => ({
            ...i,
            restockAmount: i.totalQuantity - i.remainingQuantity
          }));
        
        // Calculate meals cooked this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const mealsWeek = logsRes
          .filter(log => new Date(log.date) >= oneWeekAgo)
          .reduce((sum, log) => sum + log.mealsCooked, 0);

        setStats({
          totalIngredients: ingredientsRes.length,
          lowStockCount: lowStockItemsData.length,
          totalRecipes: recipesRes.length,
          mealsCookedWeek: mealsWeek,
          lowStockItems: lowStockItemsData
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecommendations() {
      try {
        const res = await fetch('/api/ai/recommendations');
        const data = await res.json();
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
      } finally {
        setLoadingRecs(false);
      }
    }

    fetchDashboardData();
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to GaneshInventory. Here&apos;s a summary of your kitchen.</p>
      </div>
      
      <DashboardStats stats={stats} />
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/cook" className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium">
              Cook a Meal
            </a>
            <a href="/inventory" className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium">
              Manage Inventory
            </a>
            <a href="/recipes/new" className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium col-span-2">
              Create New Recipe
            </a>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                 <Sparkles size={20} />
               </div>
               <h2 className="text-lg font-semibold text-indigo-900">What can I cook today?</h2>
             </div>
             
             {loadingRecs ? (
               <div className="flex items-center gap-3 text-indigo-600/60 py-4">
                 <Loader2 size={18} className="animate-spin" />
                 <span className="text-sm">Chef AI is checking your pantry...</span>
               </div>
             ) : recommendations.length > 0 ? (
               <div className="space-y-3">
                 {recommendations.map((rec, idx) => (
                   <div key={idx} className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                     <p className="text-sm font-bold text-indigo-950">{rec.name}</p>
                     <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">{rec.description}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-indigo-700/80 leading-relaxed bg-white/50 p-3 rounded-xl">
                 Your inventory is looking a bit empty! Try adding some ingredients so I can suggest delicious meals.
               </p>
             )}
           </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${stats.lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Items to Restock</h2>
        </div>
        
        {stats.lowStockItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Your inventory looks fantastic! No items are currently below their low stock threshold.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Restock Goal (Capacity)</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.lowStockItems.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                    <td className="py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {item.remainingQuantity} <span className="text-gray-400 text-xs font-normal">/ {item.lowStockThreshold} {item.unit} (threshold)</span>
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.totalQuantity} {item.unit}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Buy {parseFloat(item.restockAmount.toFixed(2))} {item.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
