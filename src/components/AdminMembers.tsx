import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronDown, Filter, ChevronLeft, ChevronRight, TrendingUp, Users, Heart, CheckCircle2, X, Trash2, Edit2, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const fetchMembers = async (searchQuery = '') => {
    setLoading(true);
    try {
      let query = supabase.from('members').select('*').order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMembers(data as Member[] || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await supabase.from('plans').select('*').order('price', { ascending: true });
      setPlans(data as Plan[] || []);
    } catch (e) {
      console.error('Failed to fetch plans:', e);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 2 || val.length === 0) {
      fetchMembers(val);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const exportCSV = () => {
    if (members.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined'];
    const rows = members.map(m => [
      `"${m.full_name}"`,
      m.email || '',
      m.phone,
      m.plan,
      m.status,
      new Date(m.created_at).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Members data exported successfully.');
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', memberToDelete);
      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberToDelete));
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
        // If plan changed, create a membership_history record
        if (planChanged) {
          await createMembershipHistory(data.id, formData.plan);
        }
        setMembers(members.map(m => m.id === data.id ? data : m));
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
        // Create membership_history record for new member
        await createMembershipHistory(data.id, formData.plan);
        setMembers([data, ...members]);
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
    <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">Member Management</h2>
          <p className="text-accent text-sm mt-1 mb-2 sm:mb-0">Efficiently track and manage your athlete community.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
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
            placeholder="Search members..."
            type="text"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-secondary shadow-sm">
            <span>All Plans</span>
            <ChevronDown size={18} />
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-secondary shadow-sm">
            <span>Active</span>
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-accent">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" /> Loading members...
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-accent">
                    No members found.
                  </td>
                </tr>
              ) : members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img alt={member.full_name} className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}&backgroundColor=e5e7eb`} />
                      </div>
                      <div>
                        <p className="font-bold text-secondary">{member.full_name}</p>
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
                    {member.status === 'ACTIVE' ? (
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(250,185,91,0.6)]"></span>
                        <span className="text-xs uppercase">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-accent">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-xs font-bold uppercase">{member.status}</span>
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
          <p className="text-xs font-medium text-accent">Showing {members.length} members</p>
          <div className="flex gap-2">
            <button disabled className="p-2 border border-gray-200 bg-white rounded-lg text-accent hover:bg-gray-50 hover:text-secondary transition-all shadow-sm opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button disabled className="p-2 border border-gray-200 bg-white rounded-lg text-accent hover:bg-gray-50 hover:text-secondary transition-all shadow-sm opacity-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pb-6">
        <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Total</span>
            <Users className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">{members.length}</p>
            <p className="text-sm text-accent font-medium">Total registered members</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Active</span>
            <TrendingUp className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">{members.filter(m => m.status === 'ACTIVE').length}</p>
            <p className="text-sm text-accent font-medium">Currently active members</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">Inactive</span>
            <Heart className="text-secondary" size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-secondary">{members.filter(m => m.status !== 'ACTIVE').length}</p>
            <p className="text-sm text-accent font-medium">Inactive members</p>
          </div>
        </div>
      </div>

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
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Plan {memberToEdit && memberToEdit.plan !== formData.plan && <span className="text-primary text-xs">(will create new assignment)</span>}</label>
                <select
                  value={formData.plan}
                  onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {plans.length > 0 ? plans.map(p => (
                    <option key={p.id} value={p.name}>{p.name} — ৳{p.price.toLocaleString()}</option>
                  )) : (
                    <>
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
                <input
                  type="text"
                  placeholder="e.g. Shakib Al Hasan"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Email</label>
                <input
                  type="email"
                  placeholder="e.g. shakib@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +880 1700-000000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-1">Assign Plan</label>
                <select
                  value={formData.plan}
                  onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {plans.length > 0 ? plans.map(p => (
                    <option key={p.id} value={p.name}>{p.name} — ৳{p.price.toLocaleString()}</option>
                  )) : (
                    <>
                      <option value="Basic">Basic Plan</option>
                      <option value="Pro">Pro Plan</option>
                      <option value="Premium">Elite Plan</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleAddMember} className="px-4 py-2 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 rounded-lg transition-colors">Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
