import { useState, useEffect } from 'react';
import { Dumbbell, Droplet, Clock, CalendarCheck, AlertTriangle, CheckCircle2, QrCode, TrendingUp, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [member, setMember] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Get the most recently created member for the demo
      const { data: members } = await supabase.from('members').select('*').order('created_at', { ascending: false }).limit(1);
      const currentMember = members?.[0];
      setMember(currentMember);

      if (currentMember) {
        // Attendance
        const { data: attendance } = await supabase.from('attendance').select('*').eq('member_id', currentMember.id);
        setCheckIns(attendance || []);

        // Latest membership
        const { data: history } = await supabase
          .from('membership_history')
          .select('*, plans(*)')
          .eq('member_id', currentMember.id)
          .order('created_at', { ascending: false })
          .limit(1);
        setMembership(history?.[0] || null);

        // Workout count
        const { data: workouts } = await supabase.from('workout_logs').select('id').eq('member_id', currentMember.id);
        setWorkoutCount(workouts?.length || 0);

        // Today's food calories
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: foods } = await supabase
          .from('food_logs')
          .select('calories')
          .eq('member_id', currentMember.id)
          .gte('created_at', todayStr);
        setTodayCalories(foods?.reduce((sum: number, f: any) => sum + (f.calories || 0), 0) || 0);

        // Notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentMember.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setNotifications(notifs || []);
      }
    }
    loadData();

    const channel = supabase.channel('member_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!member) return <div className="flex-1 flex items-center justify-center p-4 sm:p-8 text-accent">Loading profile...</div>;

  // Calculate expiry
  const getExpiryInfo = () => {
    if (!membership || !membership.end_date) {
      return { label: 'No Active Plan', daysLeft: -1, color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
    const endDate = new Date(membership.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: 'EXPIRED', daysLeft: 0, color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysLeft <= 3) return { label: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, daysLeft, color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysLeft <= 7) return { label: `${daysLeft} days left`, daysLeft, color: 'text-amber-600', bgColor: 'bg-amber-50' };
    return { label: `${daysLeft} days left`, daysLeft, color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const expiryInfo = getExpiryInfo();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-secondary">Welcome Back, {member.full_name.split(' ')[0]}</h1>
        <p className="text-accent text-lg">Your performance is looking great this week.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* QR Check-in Card */}
        <div className="lg:col-span-1">
          <div className="bg-card-light rounded-2xl p-6 border-2 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-secondary mb-1">Quick Check-in</h2>
                <p className="text-sm text-accent">{member.plan} Plan</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${member.status === 'ACTIVE' ? 'bg-primary/20 text-secondary' : 'bg-red-100 text-red-700'}`}>
                {member.status}
              </span>
            </div>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl border-4 border-primary shadow-sm inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(member.id)}&bgcolor=FAFAFA&color=1B2A4A`}
                  alt="Check-in QR Code"
                  className="w-40 h-40 rounded-lg"
                />
              </div>
            </div>

            {/* Expiry Countdown */}
            <div className={`${expiryInfo.bgColor} rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-3">
                {expiryInfo.daysLeft <= 3 ? (
                  <AlertTriangle className={expiryInfo.color} size={20} />
                ) : (
                  <CheckCircle2 className={expiryInfo.color} size={20} />
                )}
                <div>
                  <p className={`font-bold text-sm ${expiryInfo.color}`}>Membership Status</p>
                  <p className={`text-lg font-black ${expiryInfo.color}`}>{expiryInfo.label}</p>
                  {membership?.end_date && (
                    <p className="text-xs text-accent mt-0.5">Expires: {new Date(membership.end_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <button className="w-full bg-primary hover:bg-primary/90 text-secondary font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">
                Refresh Code
              </button>
              <button className="w-full bg-primary hover:bg-primary/90 text-secondary font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">
                Manage Subscription
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <CalendarCheck size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-black text-secondary">{checkIns.length}</div>
              <div className="text-xs font-bold text-accent tracking-wider uppercase mt-1">Check-ins</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <Dumbbell size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-black text-secondary">{workoutCount}</div>
              <div className="text-xs font-bold text-accent tracking-wider uppercase mt-1">Workouts</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-black text-secondary">{todayCalories}</div>
              <div className="text-xs font-bold text-accent tracking-wider uppercase mt-1">Calories Today</div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-card-light rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary">Recent Notifications</h2>
              <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">Mark All Read</button>
            </div>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-400 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">You have no new notifications.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const date = new Date(n.created_at);
                  return (
                    <div key={n.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-accent transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'EXPIRY' ? 'bg-red-50 text-red-600' :
                          n.type === 'INACTIVITY' ? 'bg-orange-50 text-primary' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                          <Bell size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary">{n.title}</h3>
                          <p className="text-sm text-accent mt-0.5">{n.message}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                            {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-card-light rounded-2xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-secondary">Recent Attendance</h2>
            {checkIns.length === 0 ? (
              <p className="text-accent text-sm">No check-ins yet. Visit the gym to get started!</p>
            ) : (
              <div className="space-y-3">
                {checkIns.slice(0, 5).map((ci, i) => {
                  const date = new Date(ci.check_in_time);
                  return (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary text-sm">{date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-accent">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ci.method || 'MANUAL'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">ATTENDED</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
