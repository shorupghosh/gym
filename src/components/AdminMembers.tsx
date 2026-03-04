import { useState } from 'react';
import { Search, Download, ChevronDown, Filter, ChevronLeft, ChevronRight, TrendingUp, Users, Heart, CheckCircle2, X, Trash2, Edit2, UserPlus } from 'lucide-react';

export function AdminMembers() {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(false);
    // Add delete logic here
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };
  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-secondary tracking-tight">Member Management</h2>
          <p className="text-accent text-sm mt-1">Efficiently track and manage your athlete community.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-secondary rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
            <Download size={18} />
            Export Data
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            <UserPlus size={18} />
            Add New Member
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
        <div className="w-full lg:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-secondary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400 shadow-sm" 
            placeholder="Search members..." 
            type="text"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-secondary shadow-sm">
            <span>All Plans</span>
            <ChevronDown size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-secondary shadow-sm">
            <span>Status: Active</span>
            <ChevronDown size={18} />
          </button>
          <button className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-secondary transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'Arif Hossain', email: 'arif.h@email.com', plan: 'Premium', status: 'Active', visit: 'Today, 10:45 AM', img: 'Arif' },
                  { name: 'Sadia Rahman', email: 's.rahman@email.com', plan: 'Standard', status: 'Inactive', visit: 'Oct 12, 2023', img: 'Sadia' },
                  { name: 'Mahmudul Hasan', email: 'm.hasan@email.com', plan: 'Premium', status: 'Active', visit: 'Yesterday, 6:15 PM', img: 'Mahmudul' },
                  { name: 'Farhana Akter', email: 'f.akter@email.com', plan: 'Basic', status: 'Active', visit: 'Nov 2, 2023', img: 'Farhana' },
                ].map((member, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img alt={member.name} className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.img}&backgroundColor=e5e7eb`} />
                        </div>
                        <div>
                          <p className="font-bold text-secondary">{member.name}</p>
                          <p className="text-xs text-accent">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${member.plan === 'Premium' ? 'bg-primary/20 text-secondary border-primary/30' : 'bg-gray-100 text-accent border-gray-200'}`}>
                        {member.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'Active' ? (
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(250,185,91,0.6)]"></span>
                          <span className="text-xs uppercase">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-accent">
                          <span className="w-2 h-2 rounded-full bg-accent"></span>
                          <span className="text-xs font-bold uppercase">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-accent font-medium">
                      {member.visit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setShowEditModal(true)} className="p-2 text-accent hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setShowDeleteModal(true)} className="p-2 text-accent hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs font-medium text-accent">Showing 4 of 1,284 members</p>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 bg-white rounded-lg text-accent hover:bg-gray-50 hover:text-secondary transition-all shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2 border border-gray-200 bg-white rounded-lg text-accent hover:bg-gray-50 hover:text-secondary transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Growth</span>
            <TrendingUp className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">+12%</p>
            <p className="text-sm text-accent font-medium">New members this month</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Activity</span>
            <Users className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">842</p>
            <p className="text-sm text-accent font-medium">Average daily visits</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Retention</span>
            <Heart className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">94.8%</p>
            <p className="text-sm text-accent font-medium">Membership renewal rate</p>
          </div>
        </div>
      </div>

      {/* Modals & Toasts */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 flex items-start gap-3 rounded-lg border border-transparent bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="mt-1 text-sm text-green-700">Member profile updated successfully.</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-sm w-full mx-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="text-2xl text-red-600" />
            </div>
            <h3 className="text-center text-lg font-bold text-secondary">Delete Member?</h3>
            <p className="mt-2 text-center text-sm text-accent">Are you sure you want to delete this profile? This action cannot be undone.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-secondary">Edit Member Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-secondary">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Full Name</label>
                <input type="text" defaultValue="Arif Hossain" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Email</label>
                <input type="email" defaultValue="arif.h@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Phone Number</label>
                <input type="tel" defaultValue="+880 1711-000000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Plan</label>
                <select defaultValue="Premium" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-secondary">Add New Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-secondary">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Full Name</label>
                <input type="text" placeholder="e.g. Shakib Al Hasan" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Email</label>
                <input type="email" placeholder="e.g. shakib@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Phone Number</label>
                <input type="tel" placeholder="e.g. +880 1700-000000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Plan</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>Basic Plan (৳3,000/mo)</option>
                  <option>Pro Plan (৳6,000/quarter)</option>
                  <option>Elite Plan (৳10,000/yr)</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { setShowAddModal(false); setShowSuccessToast(true); setTimeout(() => setShowSuccessToast(false), 3000); }} className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors">Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
