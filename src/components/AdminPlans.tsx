import { useState } from 'react';
import { PlusCircle, X, CheckCircle2 } from 'lucide-react';

export function AdminPlans() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSave = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-secondary">Admin Membership Plans Management</h1>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-secondary py-4 rounded-xl font-semibold text-lg transition-colors shadow-md"
        >
          <PlusCircle size={24} />
          <span>Add New Plan</span>
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Basic Plan', price: '3,000', duration: 'Monthly' },
            { name: 'Pro Plan', price: '6,000', duration: 'Quarterly' },
            { name: 'Elite Plan', price: '10,000', duration: 'Annually' },
          ].map((plan, i) => (
            <div key={i} className="bg-white rounded-xl border-t-4 border-t-secondary border-x border-b border-gray-200 p-6 shadow-sm flex flex-col">
              <h2 className="text-xl font-bold text-secondary mb-4">{plan.name}</h2>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-secondary">৳{plan.price}</span>
                  <span className="text-accent">/month</span>
                </div>
                <p className="text-sm text-accent mt-2">Duration: <span className="font-medium text-secondary">{plan.duration}</span></p>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-accent">Auto-renew</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary transition-colors focus:outline-none">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center justify-center py-2 px-4 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Edit
                </button>
                <button className="flex items-center justify-center py-2 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals & Toasts */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 flex items-start gap-3 rounded-lg border border-transparent bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="mt-1 text-sm text-green-700">Plan saved successfully.</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

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
                  defaultValue={showEditModal ? "Pro Plan" : ""}
                  placeholder="e.g. Premium Plan" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Price (৳)</label>
                <input 
                  type="number" 
                  defaultValue={showEditModal ? "6000" : ""}
                  placeholder="e.g. 5000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Duration</label>
                <select defaultValue={showEditModal ? "Quarterly" : "Monthly"} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
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
                onClick={handleSave} 
                className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors"
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
