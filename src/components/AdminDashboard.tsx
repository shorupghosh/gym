import { useState, useEffect } from 'react';
import { Search, Bell, QrCode, Users, Clock, DollarSign, Zap, AlertTriangle, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    expiringSoon: 0,
    checkInsToday: 0,
    monthlyRevenue: 0,
    recentMembers: [],
    recentActivity: []
  });

  useEffect(() => {
    loadDashboard();

    const channel = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        loadDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        loadDashboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      // 1. Get all members
      const { data: members } = await supabase.from('members').select('*');
      const allMembers = members || [];
      const totalMembers = allMembers.length;
      const activeMembers = allMembers.filter(m => m.status === 'ACTIVE').length;
      const expiredMembers = allMembers.filter(m => m.status === 'EXPIRED').length;

      // 2. Get membership history to calculate expiring soon
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: expiringHistory } = await supabase
        .from('membership_history')
        .select('*, members(full_name, status)')
        .gte('end_date', now.toISOString().split('T')[0])
        .lte('end_date', sevenDaysLater.toISOString().split('T')[0]);
      const expiringSoon = expiringHistory?.length || 0;

      // 3. Auto-update expired member statuses
      const { data: expiredHistory } = await supabase
        .from('membership_history')
        .select('member_id')
        .lt('end_date', now.toISOString().split('T')[0]);

      if (expiredHistory && expiredHistory.length > 0) {
        const expiredMemberIds = [...new Set(expiredHistory.map(h => h.member_id))];
        // Check which of these members don't have an active membership
        for (const memberId of expiredMemberIds) {
          const { data: activeHistory } = await supabase
            .from('membership_history')
            .select('id')
            .eq('member_id', memberId)
            .gte('end_date', now.toISOString().split('T')[0])
            .limit(1);

          if (!activeHistory || activeHistory.length === 0) {
            // No active membership, mark as EXPIRED
            await supabase.from('members').update({ status: 'EXPIRED' }).eq('id', memberId).eq('status', 'ACTIVE');
          }
        }
      }

      // 4. Today's check-ins
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: todayAttendance } = await supabase
        .from('attendance')
        .select('*, members(full_name)')
        .gte('check_in_time', todayStart.toISOString());
      const checkInsToday = todayAttendance?.length || 0;

      // 5. Monthly revenue from membership_history
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data: monthHistory } = await supabase
        .from('membership_history')
        .select('price_paid')
        .gte('created_at', monthStart.toISOString());
      const monthlyRevenue = monthHistory?.reduce((sum, h) => sum + (h.price_paid || 0), 0) || 0;

      // 6. Recently added members (last 5)
      const { data: recentMembers } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // 7. Recent activity (latest attendance + new members)
      const { data: recentCheckins } = await supabase
        .from('attendance')
        .select('*, members(full_name)')
        .order('check_in_time', { ascending: false })
        .limit(5);

      const recentActivity = (recentCheckins || []).map(c => ({
        name: c.members?.full_name || 'Unknown',
        action: 'Checked in',
        detail: c.method === 'QR' ? 'QR Scan' : 'Manual',
        time: getTimeAgo(new Date(c.check_in_time)),
        img: c.member_id
      }));

      // Mix in recently joined members
      const joinActivity = (recentMembers || []).slice(0, 3).map(m => ({
        name: m.full_name,
        action: 'Joined',
        detail: m.plan + ' Plan',
        time: getTimeAgo(new Date(m.created_at)),
        img: m.id
      }));

      const combined = [...recentActivity, ...joinActivity]
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 6);

      setStats({
        totalMembers,
        activeMembers,
        expiredMembers,
        expiringSoon,
        checkInsToday,
        monthlyRevenue,
        recentMembers: recentMembers || [],
        recentActivity: combined.length > 0 ? combined : [
          { name: 'No activity yet', action: '', detail: '', time: '', img: 'default' }
        ]
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const activePercent = stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light">
      <header className="py-4 sm:h-20 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 bg-background-light shrink-0 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search members or data..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center w-full justify-between sm:justify-end sm:w-auto space-x-2 sm:space-x-6">
          <button className="bg-primary hover:bg-primary/90 text-secondary font-bold py-2 px-3 sm:py-2.5 sm:px-6 rounded-xl flex items-center gap-1 sm:gap-2 shadow-sm transition-colors text-xs sm:text-base">
            <QrCode size={18} className="sm:w-[18px] sm:h-[18px] w-4 h-4" />
            <span className="hidden sm:inline">QUICK CHECK-IN</span>
            <span className="inline sm:hidden">CHECK-IN</span>
          </button>
          <button className="text-accent hover:text-secondary transition-colors relative">
            <Bell size={24} className="sm:w-6 sm:h-6 w-5 h-5" />
            {stats.expiringSoon > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats.expiringSoon}
              </span>
            )}
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
            <div className="text-right">
              <div className="font-bold text-sm text-secondary">Mahmudul Hasan</div>
              <div className="text-xs text-primary font-bold uppercase">Admin</div>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mahmudul&backgroundColor=b6e3f4" alt="Admin" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2 sm:pt-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-secondary mb-1 sm:mb-2 tracking-tight">System Overview</h1>
          <p className="text-accent text-sm sm:text-lg italic">Performance analytics for <span className="text-primary font-semibold not-italic">Dhaka Fit & Flex</span></p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Active Members */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{activePercent}%</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Active Members</div>
            <div className="text-4xl font-black text-secondary mb-4">{stats.activeMembers} <span className="text-lg text-accent font-medium">/ {stats.totalMembers}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${activePercent}%` }}></div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stats.expiringSoon > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {stats.expiringSoon > 0 ? 'Urgent' : 'Good'}
              </span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Expiring Soon (7 Days)</div>
            <div className="text-4xl font-black text-secondary mb-4">{stats.expiringSoon}</div>
            <div className="text-xs font-medium text-secondary">{stats.expiringSoon > 0 ? 'Action required for renewals' : 'No urgent renewals'}</div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <DollarSign size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">LIVE</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Revenue (MTD)</div>
            <div className="text-4xl font-black text-secondary mb-4">৳{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-xs font-medium text-primary">Monthly Target: ৳150,000</div>
          </div>

          {/* Check-ins Today */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">LIVE</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Check-ins Today</div>
            <div className="text-4xl font-black text-secondary mb-4">{stats.checkInsToday}</div>
            <div className="text-xs font-medium text-secondary">{stats.checkInsToday > 0 ? 'Peak activity detected' : 'No check-ins yet today'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recently Added Members */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-secondary">Recently Added Members</h2>
                <p className="text-xs font-bold text-accent tracking-wider uppercase mt-1">Latest Registrations</p>
              </div>
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                <span className="text-sm font-bold text-primary">{stats.recentMembers.length} new</span>
              </div>
            </div>

            {stats.recentMembers.length === 0 ? (
              <div className="text-center py-12 text-accent">
                <Users size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No members registered yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentMembers.map((member, i) => {
                  const joinDate = new Date(member.created_at);
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}&backgroundColor=f3f4f6`}
                          alt={member.full_name}
                          className="w-11 h-11 rounded-xl border border-gray-200"
                        />
                        <div>
                          <h4 className="font-bold text-secondary text-sm">{member.full_name}</h4>
                          <p className="text-xs text-accent mt-0.5">{member.phone} • {member.plan} Plan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                          member.status === 'EXPIRED' ? 'bg-red-50 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                          {member.status}
                        </span>
                        <p className="text-xs text-accent mt-1">{joinDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Activity */}
          <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl p-0 shadow-sm border border-gray-100 flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-secondary">Live Activity</h2>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> ACTIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {stats.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.img}&backgroundColor=f3f4f6`}
                    alt={activity.name}
                    className="w-12 h-12 rounded-xl border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-secondary text-sm">{activity.name}</h4>
                    <p className="text-xs text-accent mt-0.5">
                      {activity.action}
                      {activity.detail && (
                        <> • <span className="italic text-primary">{activity.detail}</span></>
                      )}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-secondary uppercase">{activity.time}</div>
                </div>
              ))}
            </div>
            <button className="p-4 border-t border-gray-100 text-xs font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-wider text-center w-full rounded-b-2xl">
              Expand All Activity
            </button>
          </div>
        </div>

        {/* Expired Members Alert */}
        {stats.expiredMembers > 0 && (
          <div className="mt-6 sm:mt-8 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-600 sm:w-6 sm:h-6 w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800">Expired Memberships</h3>
              <p className="text-sm text-red-600 mt-0.5">{stats.expiredMembers} member{stats.expiredMembers !== 1 ? 's have' : ' has'} expired memberships. Consider reaching out for renewals.</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">
              View Expired
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
