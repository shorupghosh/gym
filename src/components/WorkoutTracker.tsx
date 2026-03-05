import React, { useState, useEffect } from 'react';
import { Dumbbell, PlusCircle, X, Trash2, Loader2, Clock, Flame, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WorkoutLog {
    id: string;
    member_id: string;
    workout_type: string;
    duration_minutes: number | null;
    notes: string | null;
    created_at: string;
}

export function WorkoutTracker() {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [member, setMember] = useState<any>(null);

    const [formData, setFormData] = useState({
        workout_type: '',
        duration_minutes: '',
        notes: ''
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
                    .from('workout_logs')
                    .select('*')
                    .eq('member_id', currentMember.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setWorkouts(data || []);
            }
        } catch (err) {
            console.error('Error loading workouts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorkout = async () => {
        if (!member) return;
        try {
            const payload = {
                member_id: member.id,
                workout_type: formData.workout_type,
                duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
                notes: formData.notes || null,
            };
            const { data, error } = await supabase.from('workout_logs').insert([payload]).select().single();
            if (error) throw error;
            if (data) setWorkouts([data, ...workouts]);
        } catch (err) {
            console.error('Error adding workout:', err);
        }
        setShowAddModal(false);
        setFormData({ workout_type: '', duration_minutes: '', notes: '' });
    };

    const handleDeleteWorkout = async (id: string) => {
        try {
            const { error } = await supabase.from('workout_logs').delete().eq('id', id);
            if (error) throw error;
            setWorkouts(workouts.filter(w => w.id !== id));
        } catch (err) {
            console.error('Error deleting workout:', err);
        }
    };

    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const thisWeekWorkouts = workouts.filter(w => {
        const d = new Date(w.created_at);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
    });

    const workoutTypes = [
        'Chest & Triceps', 'Back & Biceps', 'Legs & Glutes', 'Shoulders & Arms',
        'Full Body', 'Cardio', 'HIIT', 'Yoga', 'Swimming', 'Running', 'Other'
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-secondary">Workout Tracker</h1>
                    <p className="text-accent text-lg">Log and monitor your training sessions.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                >
                    <PlusCircle size={20} />
                    LOG WORKOUT
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-primary rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">TOTAL WORKOUTS</h3>
                        <Dumbbell size={20} className="text-secondary/70" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{workouts.length}</span>
                        <span className="text-sm font-medium text-secondary/80">All Time</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">THIS WEEK</h3>
                        <Calendar size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{thisWeekWorkouts.length}</span>
                        <span className="text-sm font-medium text-accent">sessions</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">TOTAL TIME</h3>
                        <Clock size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{Math.round(totalMinutes / 60)}</span>
                        <span className="text-sm font-medium text-accent">hours</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-secondary text-sm tracking-wide">AVG SESSION</h3>
                        <TrendingUp size={20} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0}</span>
                        <span className="text-sm font-medium text-accent">min</span>
                    </div>
                </div>
            </div>

            {/* Workout List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : workouts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Dumbbell size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-secondary mb-2">No workouts logged yet</h3>
                    <p className="text-accent">Start logging your workouts to track your progress!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-secondary mb-4">WORKOUT LOG</h2>
                    {workouts.map((workout) => {
                        const date = new Date(workout.created_at);
                        return (
                            <div key={workout.id} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Dumbbell size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary text-lg">{workout.workout_type}</h3>
                                        <div className="flex items-center gap-3 text-sm text-accent mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            {workout.duration_minutes && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {workout.duration_minutes} min</span>
                                                </>
                                            )}
                                        </div>
                                        {workout.notes && <p className="text-xs text-accent mt-1 italic">{workout.notes}</p>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteWorkout(workout.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Workout Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-secondary">Log Workout</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-secondary">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Workout Type</label>
                                <select
                                    value={formData.workout_type}
                                    onChange={e => setFormData({ ...formData, workout_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Select workout...</option>
                                    {workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    placeholder="e.g. 60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Notes (optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="How did it feel?"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                />
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
                                onClick={handleAddWorkout}
                                disabled={!formData.workout_type}
                                className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Log Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
