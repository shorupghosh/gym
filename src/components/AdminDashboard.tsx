import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, QrCode, Users, Clock, DollarSign, Zap, AlertTriangle, UserPlus, TrendingUp } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoon: number;
  checkInsToday: number;
  monthlyRevenue: number;
  recentMembers: any[];
  recentActivity: any[];
}

export function AdminDashboard() {
  const { members, attendance, loading: contextLoading, plans } = useGym();
  const [revenue, setRevenue] = useState(0);

  // Calculate most stats locally from the context data
  const stats = useMemo(() => {
    const active = members.filter(m => m.status === 'ACTIVE').length;
    const expired = members.filter(m => m.status === 'EXPIRED').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIns = attendance.filter(a => {
      const checkDate = new Date(a.check_in_time);
      return checkDate >= today;
    }).length;

    const recent = [...members].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 5);

    const activity = attendance.slice(0, 5).map(a => ({
      id: a.id,
      member_name: a.members?.full_name || 'Unknown',
      time: new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: a.method
    }));

    return {
      totalMembers: members.length,
      activeMembers: active,
      expiredMembers: expired,
      checkInsToday: checkIns,
      recentMembers: recent,
      recentActivity: activity
    };
  }, [members, attendance]);

  // Fetch revenue separately as it's from a different table not yet in context
  useEffect(() => {
    const fetchRevenue = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data } = await supabase
        .from('membership_history')
        .select('metadata')
        .gte('created_at', monthStart);

      const total = data?.reduce((acc, curr) => acc + (curr.metadata?.price_paid || 0), 0) || 0;
      setRevenue(total);
    };

    fetchRevenue();
  }, [members]); // Refresh if members change

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex-1 bg-background-light p-4 sm:p-8 overflow-hidden"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">Admin Dashboard</h2>
          <p className="text-accent text-sm mt-1">Gym operations at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm"
              placeholder="Quick search..."
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-accent hover:text-secondary shadow-sm relative transition-all hover:bg-gray-50">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <motion.div variants={cardVariants}>
          <StatCard
            icon={<Users className="text-primary" size={20} />}
            label="Total Members"
            value={stats.totalMembers}
            trend="+12%"
            color="bg-amber-50"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            icon={<Zap className="text-green-600" size={20} />}
            label="Active This Month"
            value={stats.activeMembers}
            trend="+5%"
            color="bg-green-50"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            icon={<Clock className="text-blue-600" size={20} />}
            label="Check-ins Today"
            value={stats.checkInsToday}
            trend="85% cap"
            color="bg-blue-50"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            icon={<DollarSign className="text-purple-600" size={20} />}
            label="Monthly Revenue"
            value={`৳${revenue.toLocaleString()}`}
            trend="+18%"
            color="bg-purple-50"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 overflow-hidden">
        {/* Recent Check-ins */}
        <motion.div variants={cardVariants} className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-secondary uppercase tracking-wider text-sm">Recent Activity</h3>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-6 flex-1">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 group cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/10 transition-colors">
                  <QrCode size={18} className="text-accent group-hover:text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary truncate">{activity.member_name}</p>
                  <p className="text-[10px] text-accent font-medium uppercase tracking-widest">{activity.method} Check-in</p>
                </div>
                <p className="text-xs font-black text-secondary">{activity.time}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* New Members Showcase */}
        <motion.div variants={cardVariants} className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-secondary uppercase tracking-wider text-sm">New Members</h3>
              <p className="text-[10px] text-accent font-bold mt-1">Waitlist & recently joined athletes.</p>
            </div>
            <button className="flex items-center gap-2 py-2 px-4 bg-secondary text-white rounded-xl text-xs font-black hover:bg-secondary/90 transition-all active:scale-95 shadow-lg shadow-secondary/10">
              <UserPlus size={14} /> Add Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-accent uppercase tracking-widest">Athlete</th>
                  <th className="pb-4 text-[10px] font-black text-accent uppercase tracking-widest">Plan</th>
                  <th className="pb-4 text-[10px] font-black text-accent uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black text-accent uppercase tracking-widest text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                          {member.full_name?.split(' ').map((n: any) => n[0]).join('')}
                        </div>
                        <p className="text-xs font-bold text-secondary">{member.full_name}</p>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-medium text-accent">{member.plan}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[10px] font-black text-secondary italic">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary/20 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={10} /> {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-accent uppercase tracking-widest">{label}</p>
      <div className="text-2xl font-black text-secondary mt-1">{value}</div>
    </div>
  );
}
