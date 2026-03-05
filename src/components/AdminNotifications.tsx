import React, { useState, useEffect } from 'react';
import { Send, Search, Bell, Clock, CheckCircle2, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Member {
    id: string;
    full_name: string;
    phone: string;
}

interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
    members?: Partial<Member>;
}

export function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch members for dropdown
            const { data: mData, error: mError } = await supabase
                .from('members')
                .select('id, full_name, phone')
                .order('full_name', { ascending: true });
            if (mError) throw mError;
            setMembers(mData || []);

            // Fetch notification history
            const { data: nData, error: nError } = await supabase
                .from('notifications')
                .select(`
          *,
          members(id, full_name)
        `)
                .order('created_at', { ascending: false })
                .limit(50);
            if (nError) throw nError;
            setNotifications(nData || []);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSubmitting(true);
        try {
            const payloads = [];
            const newNotifs = [];

            if (selectedUser === 'all') {
                members.forEach(m => {
                    payloads.push({
                        user_id: m.id,
                        title,
                        message,
                        type: 'MANUAL',
                        read: false
                    });
                });
            } else {
                payloads.push({
                    user_id: selectedUser,
                    title,
                    message,
                    type: 'MANUAL',
                    read: false
                });
            }

            const { data, error } = await supabase.from('notifications').insert(payloads).select(`*, members(id, full_name)`);
            if (error) throw error;

            setNotifications((prev) => [...(data || []), ...prev]);
            setTitle('');
            setMessage('');
            setSelectedUser('all');
            setToastMessage(`Notification sent successfully to ${selectedUser === 'all' ? 'all members' : 'member'}!`);
            setTimeout(() => setToastMessage(''), 3000);
        } catch (err) {
            console.error('Error sending notification:', err);
            alert('Failed to send notification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.members?.full_name && n.members.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-secondary tracking-tight text-3xl font-bold leading-tight">Communications</h2>
                <p className="text-accent text-base font-normal leading-normal">Send manual alerts or push notifications to members.</p>
            </div>

            {toastMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={18} />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Send Notification Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                            <Send size={20} className="text-primary" />
                            New Notification
                        </h3>

                        <form onSubmit={handleSendNotification} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Recipient</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="all">All Members (Broadcast)</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Gym Holiday Notice"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-secondary mb-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !title || !message}
                                className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Send Notification
                            </button>
                        </form>
                    </div>
                </div>

                {/* Notification History */}
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)]">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                                <Clock size={20} className="text-primary" />
                                Recent History
                            </h3>

                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 size={32} className="animate-spin text-primary" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Bell size={48} className="mb-4 text-gray-200" />
                                    <p className="font-medium text-secondary">No notifications found.</p>
                                    <p className="text-sm">They will appear here once sent.</p>
                                </div>
                            ) : (
                                filteredNotifications.map((n) => {
                                    const date = new Date(n.created_at);
                                    const isGlobal = n.members ? false : true;

                                    return (
                                        <div key={n.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white transition-all group">
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'EXPIRY' ? 'bg-red-50 text-red-600' :
                                                    n.type === 'INACTIVITY' ? 'bg-orange-50 text-primary' :
                                                        'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    <Bell size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-1">
                                                        <h4 className="font-bold text-secondary leading-tight">{n.title}</h4>
                                                        <span className="text-[10px] font-bold text-accent whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wider">
                                                            {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-3">{n.message}</p>

                                                    <div className="flex items-center gap-3 text-xs font-semibold">
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                                                            <User size={12} />
                                                            {n.members?.full_name || 'All Members'}
                                                        </div>

                                                        <div className={`px-2.5 py-1 rounded-md border text-center ${n.type === 'MANUAL' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                            n.type === 'EXPIRY' ? 'bg-red-50 border-red-100 text-red-600' :
                                                                'bg-orange-50 border-orange-100 text-orange-600'
                                                            }`}>
                                                            {n.type}
                                                        </div>

                                                        {n.read && (
                                                            <div className="flex items-center gap-1 text-green-600 ml-auto">
                                                                <CheckCircle2 size={14} />
                                                                <span>Read</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
