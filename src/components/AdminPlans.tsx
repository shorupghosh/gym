import { useState } from 'react';
import { PlusCircle, X, CheckCircle2, Loader2, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGym } from '../context/GymContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  duration_type: string;
  description: string | null;
  created_at: string;
}

export function AdminPlans() {
  const { plans, refreshData } = useGym();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: '30',
    duration_type: 'Monthly',
    description: ''
  });

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const validatePlanForm = (): string | null => {
    if (!formData.name.trim()) return 'Plan name is required.';
    if (!formData.price || Number(formData.price) <= 0) return 'Price must be a positive number.';
    if (!formData.duration_days || Number(formData.duration_days) < 1) return 'Duration must be at least 1 day.';
    return null;
  };

  const handleAddPlan = async () => {
    const validationError = validatePlanForm();
    if (validationError) { showToast(validationError); return; }
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        duration_days: Number(formData.duration_days),
        duration_type: formData.duration_type,
        description: formData.description.trim()
      };

      const { data, error } = await supabase.from('plans').insert([payload]).select().single();
      if (error) throw error;

      if (data) {
        refreshData();
        showToast('Plan created successfully.');
      }
    } catch (e) {
      console.error('Error creating plan:', e);
    }
    setShowAddModal(false);
  };

  const handleEditPlan = async () => {
    if (!planToEdit) return;
    const validationError = validatePlanForm();
    if (validationError) { showToast(validationError); return; }
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        duration_days: Number(formData.duration_days),
        duration_type: formData.duration_type,
        description: formData.description.trim()
      };

      const { data, error } = await supabase.from('plans').update(payload).eq('id', planToEdit.id).select().single();
      if (error) throw error;

      if (data) {
        refreshData();
        showToast('Plan updated successfully.');
      }
    } catch (e) {
      console.error('Error updating plan:', e);
    }
    setShowEditModal(false);
    setPlanToEdit(null);
  };

  const confirmDeletePlan = async (planId: string) => {
    setIsCheckingDelete(true);
    setPlanToDelete(planId);
    setDeleteWarning(null);
    try {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        const { count } = await supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('plan', plan.name);
        if (count && count > 0) {
          setDeleteWarning(`${count} member${count > 1 ? 's are' : ' is'} currently on this plan. They will keep their current status but won't be linked to this plan.`);
        }
      }
    } catch (e) {
      console.error('Error checking plan usage:', e);
    }
    setIsCheckingDelete(false);
    setShowDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      const { error } = await supabase.from('plans').delete().eq('id', planToDelete);
      if (error) throw error;

      refreshData();
      showToast('Plan deleted successfully.');
    } catch (e) {
      console.error('Error deleting plan:', e);
    }
    setShowDeleteModal(false);
    setPlanToDelete(null);
    setDeleteWarning(null);
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      price: '',
      duration_days: '30',
      duration_type: 'Monthly',
      description: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setPlanToEdit(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      duration_type: plan.duration_type,
      description: plan.description || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-secondary">Admin Membership Plans Management</h1>

        <button
          onClick={openAddModal}
          className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-secondary py-4 rounded-xl font-semibold text-lg transition-colors shadow-md"
        >
          <PlusCircle size={24} />
          <span>Add New Plan</span>
        </button>

        {plans.length === 0 ? (
          <div className="text-center py-12 text-accent bg-white rounded-xl border border-gray-200">
            No plans found. Create your first plan above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl border-t-4 border-t-secondary border-x border-b border-gray-200 p-6 shadow-sm flex flex-col">
                <h2 className="text-xl font-bold text-secondary mb-4">{plan.name}</h2>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-secondary">৳{plan.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-accent mt-2">Duration: <span className="font-medium text-secondary">{plan.duration_type} ({plan.duration_days} days)</span></p>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => confirmDeletePlan(plan.id)}
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 flex items-start gap-3 rounded-lg border border-transparent bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="mt-1 text-sm text-green-700">{successMessage}</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-sm w-full mx-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="text-2xl text-red-600" />
            </div>
            <h3 className="text-center text-lg font-bold text-secondary">Delete Plan?</h3>
            <p className="mt-2 text-center text-sm text-accent">Are you sure you want to delete this plan?</p>
            {deleteWarning && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-medium text-amber-800">⚠️ {deleteWarning}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteWarning(null); }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                {deleteWarning ? 'Delete Anyway' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-secondary">
                {showAddModal ? 'Add New Plan' : 'Edit Plan'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-secondary">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premium Plan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Price (৳)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-1">Duration Type</label>
                  <select
                    value={formData.duration_type}
                    onChange={e => setFormData({ ...formData, duration_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-1">Total Days</label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddPlan : handleEditPlan}
                className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                disabled={!formData.name || !formData.price || !formData.duration_days}
              >
                {showAddModal ? 'Create Plan' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
