import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Trash2, Loader2, Apple, Flame, TrendingUp, Utensils } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FoodLog {
    id: string;
    member_id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: string;
    created_at: string;
}

export function FoodTracker() {
    const [foods, setFoods] = useState<FoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [member, setMember] = useState<any>(null);

    const [formData, setFormData] = useState({
        food_name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        meal_type: 'Snack'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: members } = await supabase.from('members').select('*').order('created_at', { ascending: false }).limit(1);
            const currentMember = members?.[0];
            setMember(currentMember);

            if (currentMember) {
                const { data, error } = await supabase
                    .from('food_logs')
                    .select('*')
                    .eq('member_id', currentMember.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setFoods(data || []);
            }
        } catch (err) {
            console.error('Error loading food logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFood = async () => {
        if (!member) return;
        try {
            const payload = {
                member_id: member.id,
                food_name: formData.food_name,
                calories: Number(formData.calories) || 0,
                protein: Number(formData.protein) || 0,
                carbs: Number(formData.carbs) || 0,
                fat: Number(formData.fat) || 0,
                meal_type: formData.meal_type,
            };
            const { data, error } = await supabase.from('food_logs').insert([payload]).select().single();
            if (error) throw error;
            if (data) setFoods([data, ...foods]);
        } catch (err) {
            console.error('Error adding food log:', err);
        }
        setShowAddModal(false);
        setFormData({ food_name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'Snack' });
    };

    const handleDeleteFood = async (id: string) => {
        try {
            const { error } = await supabase.from('food_logs').delete().eq('id', id);
            if (error) throw error;
            setFoods(foods.filter(f => f.id !== id));
        } catch (err) {
            console.error('Error deleting food log:', err);
        }
    };

    // Today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFoods = foods.filter(f => f.created_at.startsWith(todayStr));
    const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const todayProtein = todayFoods.reduce((sum, f) => sum + (f.protein || 0), 0);
    const todayCarbs = todayFoods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const todayFat = todayFoods.reduce((sum, f) => sum + (f.fat || 0), 0);

    const mealIcons: Record<string, string> = {
        'Breakfast': '🌅',
        'Lunch': '☀️',
        'Dinner': '🌙',
        'Snack': '🍎'
    };

    const mealColors: Record<string, string> = {
        'Breakfast': 'bg-amber-50 text-amber-700',
        'Lunch': 'bg-blue-50 text-blue-700',
        'Dinner': 'bg-purple-50 text-purple-700',
        'Snack': 'bg-green-50 text-green-700'
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-secondary">Food Tracker</h1>
                    <p className="text-accent text-lg">Track your meals and nutrition intake.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                >
                    <PlusCircle size={20} />
                    LOG FOOD
                </button>
            </div>

            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-primary rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">TODAY'S CALORIES</h3>
                        <Flame size={20} className="text-secondary/70" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{todayCalories.toLocaleString()}</span>
                        <span className="text-sm font-medium text-secondary/80">kcal</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">PROTEIN</h3>
                        <TrendingUp size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{todayProtein}</span>
                        <span className="text-sm font-medium text-accent">g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(todayProtein / 1.5, 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">CARBS</h3>
                        <Apple size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{todayCarbs}</span>
                        <span className="text-sm font-medium text-accent">g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(todayCarbs / 2.5, 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">FAT</h3>
                        <Utensils size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{todayFat}</span>
                        <span className="text-sm font-medium text-accent">g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                        <div className="bg-rose-400 h-1.5 rounded-full" style={{ width: `${Math.min(todayFat / 0.8, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Food Log */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : foods.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-secondary mb-2">No meals logged yet</h3>
                    <p className="text-accent">Start tracking your nutrition to reach your goals!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-secondary mb-4">MEAL LOG</h2>
                    {foods.map((food) => {
                        const date = new Date(food.created_at);
                        return (
                            <div key={food.id} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                                        {mealIcons[food.meal_type] || '🍽️'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-secondary text-lg">{food.food_name}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${mealColors[food.meal_type] || 'bg-gray-100 text-gray-700'}`}>{food.meal_type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-accent mt-1">
                                            <span>{date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="font-medium text-primary">{food.calories} kcal</span>
                                            <span className="text-gray-300">•</span>
                                            <span>P: {food.protein}g</span>
                                            <span>C: {food.carbs}g</span>
                                            <span>F: {food.fat}g</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteFood(food.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Food Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-secondary">Log Meal</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-secondary">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Food Name</label>
                                <input
                                    type="text"
                                    value={formData.food_name}
                                    onChange={e => setFormData({ ...formData, food_name: e.target.value })}
                                    placeholder="e.g. Grilled Chicken Salad"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Meal Type</label>
                                <select
                                    value={formData.meal_type}
                                    onChange={e => setFormData({ ...formData, meal_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="Breakfast">🌅 Breakfast</option>
                                    <option value="Lunch">☀️ Lunch</option>
                                    <option value="Dinner">🌙 Dinner</option>
                                    <option value="Snack">🍎 Snack</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Calories (kcal)</label>
                                <input
                                    type="number"
                                    value={formData.calories}
                                    onChange={e => setFormData({ ...formData, calories: e.target.value })}
                                    placeholder="e.g. 350"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Protein (g)</label>
                                    <input
                                        type="number"
                                        value={formData.protein}
                                        onChange={e => setFormData({ ...formData, protein: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Carbs (g)</label>
                                    <input
                                        type="number"
                                        value={formData.carbs}
                                        onChange={e => setFormData({ ...formData, carbs: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Fat (g)</label>
                                    <input
                                        type="number"
                                        value={formData.fat}
                                        onChange={e => setFormData({ ...formData, fat: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFood}
                                disabled={!formData.food_name || !formData.calories}
                                className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Log Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
