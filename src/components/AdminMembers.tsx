import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronDown, Filter, ChevronLeft, ChevronRight, TrendingUp, Users, Heart, CheckCircle2, X, Trash2, Edit2, UserPlus, Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGym } from '../context/GymContext';

interface Member {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  plan: string;
  status: string;
  date_of_birth?: string | null;
  gender?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  duration_type: string;
}

export function AdminMembers() {
  const {
    members: allMembers,
    plans,
    refreshData,
    loading: contextLoading,
    addMember,
    updateMember,
    deleteMember
  } = useGym();

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    plan: 'Basic',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (!search) {
      setFilteredMembers(allMembers);
    } else {
      const lower = search.toLowerCase();
      setFilteredMembers(allMembers.filter(m =>
        m.full_name?.toLowerCase().includes(lower) ||
        m.phone?.toLowerCase().includes(lower) ||
        m.email?.toLowerCase().includes(lower)
      ));
    }
  }, [allMembers, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined Date'];
    const csvRows = allMembers.map(m => [
      `"${m.full_name}"`,
      `"${m.email || 'N/A'}"`,
      `"${m.phone}"`,
      `"${m.plan}"`,
      `"${m.status}"`,
      `"${new Date(m.created_at).toLocaleDateString()}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Members data exported successfully.');
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', memberToDelete);
      if (error) throw error;

      deleteMember(memberToDelete);
      showToast('Member deleted successfully.');
    } catch (e) {
      console.error('Error deleting member:', e);
    }
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const createMembershipHistory = async (memberId: string, planName: string) => {
    const plan = plans.find(p => p.name === planName);
    if (!plan) return;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (plan.duration_days || 30));

    await supabase.from('membership_history').insert([{
      member_id: memberId,
      plan_id: plan.id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      price_paid: plan.price
    }]);
  };

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) return 'Full name is required.';
    if (formData.full_name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!formData.phone.trim()) return 'Phone number is required.';
    if (formData.phone.trim().length < 7) return 'Enter a valid phone number (min 7 digits).';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Enter a valid email address.';
    return null;
  };

  const handleSaveEdit = async () => {
    if (!memberToEdit) return;
    const validationError = validateForm();
    if (validationError) { showToast(validationError); return; }
    try {
      const planChanged = memberToEdit.plan !== formData.plan;

      const { data, error } = await supabase
        .from('members')
        .update({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          plan: formData.plan,
          status: formData.status
        })
        .eq('id', memberToEdit.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        if (planChanged) {
          await createMembershipHistory(data.id, formData.plan);
        }
        updateMember(data.id, data);
        showToast(planChanged ? 'Plan assigned & member updated.' : 'Member profile updated.');
      }
    } catch (e) {
      console.error('Error updating member:', e);
    }
    setShowEditModal(false);
    setMemberToEdit(null);
  };

  const handleAddMember = async () => {
    const validationError = validateForm();
    if (validationError) { showToast(validationError); return; }
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          plan: formData.plan,
          status: formData.status
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await createMembershipHistory(data.id, formData.plan);
        addMember(data);
        showToast('Member added & plan assigned successfully.');
      }
    } catch (e) {
      console.error('Error adding member:', e);
    }
    setShowAddModal(false);
  };

  const openEditModal = (member: Member) => {
    setMemberToEdit(member);
    setFormData({
      full_name: member.full_name,
      email: member.email || '',
      phone: member.phone || '',
      plan: member.plan || 'Basic',
      status: member.status || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setFormData({ full_name: '', email: '', phone: '', plan: 'Basic', status: 'ACTIVE' });
    setShowAddModal(true);
  };

  return (
    <div className="flex-1 bg-background-light p-4 sm:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
            Member Management
            {contextLoading && <RefreshCcw size={20} className="animate-spin text-primary" />}
          </h2>
          <p className="text-accent text-sm mt-1 mb-2 sm:mb-0">Efficiently track and manage your athlete community.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => refreshData()} className="p-2.5 bg-white border border-gray-200 rounded-xl text-accent hover:text-secondary hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center" title="Force Refresh">
            <RefreshCcw size={18} className={contextLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-secondary rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm w-full sm:w-auto">
            <Download size={18} />
            Export Data
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm w-full sm:w-auto"
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
            placeholder={`Search ${allMembers.length} members...`}
            type="text"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex -space-x-2 mr-2">
            {allMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-[10px] font-bold text-secondary shadow-sm">
                {m.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
            ))}
            {allMembers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-secondary border-2 border-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                +{allMembers.length - 5}
              </div>
            )}
          </div>
          <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-secondary shadow-sm">
            <span>All Plans</span>
            <ChevronDown size={18} />
          </button>
          <button className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-secondary transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-accent">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" /> Loading members...
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-accent">
                    {search ? 'No members match your search.' : 'No members found. Add your first member!'}
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sidebar-light/10 overflow-hidden flex items-center justify-center text-secondary font-bold">
                        {member.full_name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-secondary group-hover:text-primary transition-colors">{member.full_name}</p>
                        <p className="text-xs text-accent italic">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/5 text-secondary border border-secondary/10">
                      {member.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.status === 'ACTIVE' ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-wider">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-accent">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{member.status}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(member)} className="p-2 text-accent hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { setMemberToDelete(member.id); setShowDeleteModal(true); }} className="p-2 text-accent hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <p className="text-sm text-accent font-medium">
            Showing <span className="text-secondary font-bold">{filteredMembers.length}</span> of <span className="text-secondary font-bold">{allMembers.length}</span> members
          </p>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg text-accent hover:text-secondary disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg text-accent hover:text-secondary disabled:opacity-50" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-secondary text-center">Delete Member?</h3>
            <p className="text-accent text-sm text-center mt-2">This action is permanent and will remove all attendance history for this member.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-bold text-accent hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 flex items-start gap-3 rounded-lg border border-transparent bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="mt-1 text-sm text-green-700">{successMessage}</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-accent hover:text-secondary">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-secondary">{showEditModal ? 'Edit Member' : 'Add New Member'}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-accent hover:text-secondary p-1">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-accent uppercase tracking-wider">Full Name</label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-secondary font-medium"
                  placeholder="e.g. Shakib Al Mamun"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-accent uppercase tracking-wider">Phone</label>
                  <input
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-secondary font-medium"
                    placeholder="+8801..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-accent uppercase tracking-wider">Email (Optional)</label>
                  <input
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-secondary font-medium"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-accent uppercase tracking-wider">Membership Plan</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-secondary font-bold appearance-none cursor-pointer"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-accent uppercase tracking-wider">Initial Status</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-secondary font-bold appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="FROZEN">Frozen</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-black text-accent hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={showEditModal ? handleSaveEdit : handleAddMember}
                className="flex-1 py-3 px-4 rounded-xl bg-secondary text-white text-sm font-black hover:bg-secondary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : (showEditModal ? 'Save Changes' : 'Create Member')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
