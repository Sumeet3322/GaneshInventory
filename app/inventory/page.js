"use client";

import { useState, useEffect } from "react";
import IngredientTable from "@/components/IngredientTable";
import { Plus, RefreshCw, Wand2, Loader2 } from "lucide-react";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    totalQuantity: "",
    unit: "g",
    lowStockThreshold: ""
  });

  const fetchIngredients = async () => {
    try {
      const res = await fetch("/api/ingredients");
      const data = await res.json();
      setIngredients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestockAll = async () => {
    if (!confirm("Are you sure you want to restock all ingredients? This will reset all used quantities to 0 and fill remaining amounts back to total capacity.")) return;
    try {
      await fetch('/api/ingredients/restock', { method: 'POST' });
      fetchIngredients();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleEdit = (item) => {
    setEditingIngredient(item);
    setFormData({
      name: item.name,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;
    try {
      await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
      fetchIngredients();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingIngredient;
    const url = isEdit ? `/api/ingredients/${editingIngredient._id}` : "/api/ingredients";
    const method = isEdit ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalQuantity: parseFloat(formData.totalQuantity),
          lowStockThreshold: parseFloat(formData.lowStockThreshold)
        })
      });
      setShowModal(false);
      setEditingIngredient(null);
      setFormData({ name: "", totalQuantity: "", unit: "g", lowStockThreshold: "" });
      fetchIngredients();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your raw ingredients and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestockAll}
            className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-100 transition focus:ring-2 focus:ring-green-500 focus:ring-offset-2 border border-green-200"
          >
            <RefreshCw size={18} />
            Restock All
          </button>
          <button
            onClick={() => {
              setEditingIngredient(null);
              setFormData({ name: "", totalQuantity: "", unit: "g", lowStockThreshold: "" });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            Add Ingredient
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>
      ) : (
        <IngredientTable
          ingredients={ingredients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 slide-in-from-bottom-4 animate-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50 pr-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {!editingIngredient && (
                    <button
                      type="button"
                      onClick={handlePredict}
                      disabled={isPredicting || !formData.name}
                      title="AI Predict Unit & Threshold"
                      className="absolute right-2 text-indigo-500 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="l">Liters (l)</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700"
                >
                  {editingIngredient ? "Save Changes" : "Add Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
