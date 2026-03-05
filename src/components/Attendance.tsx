import { useState, useEffect } from 'react';
import { QrCode, Calendar as CalendarIcon, Clock, Flame, Award, ChevronLeft, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Attendance() {
  const [member, setMember] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function loadData() {
      const { data: members } = await supabase.from('members').select('*').order('created_at', { ascending: false }).limit(1);
      const currentMember = members?.[0];
      setMember(currentMember);

      if (currentMember) {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('member_id', currentMember.id)
          .order('check_in_time', { ascending: false });
        setCheckIns(attendance || []);
      }
    }
    loadData();
  }, []);

  if (!member) return <div className="flex-1 flex items-center justify-center p-4 sm:p-8 text-accent">Loading attendance...</div>;

  // Calculate real stats
  const thisWeek = checkIns.filter(c => {
    const d = new Date(c.check_in_time);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const thisMonth = checkIns.filter(c => {
    const d = new Date(c.check_in_time);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Calculate streak (consecutive days with check-ins)
  const calculateStreak = () => {
    if (checkIns.length === 0) return 0;
    const daySet = new Set(
      checkIns.map(c => new Date(c.check_in_time).toISOString().split('T')[0])
    );
    const sortedDays = Array.from(daySet).sort().reverse();
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const curr = new Date(sortedDays[i - 1] as string);
      const prev = new Date(sortedDays[i] as string);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  const streak = calculateStreak();

  // Consistency badge
  const getConsistencyBadge = () => {
    if (thisMonth >= 20) return { label: 'PLATINUM', detail: 'Top 5%', color: 'text-purple-600' };
    if (thisMonth >= 15) return { label: 'GOLD', detail: 'Top 10%', color: 'text-primary' };
    if (thisMonth >= 10) return { label: 'SILVER', detail: 'Top 25%', color: 'text-gray-500' };
    if (thisMonth >= 5) return { label: 'BRONZE', detail: 'Top 50%', color: 'text-amber-700' };
    return { label: 'STARTER', detail: 'Keep going!', color: 'text-gray-400' };
  };

  const badge = getConsistencyBadge();

  // Dynamic calendar
  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    // Dates with check-ins
    const checkinDates = new Set(
      checkIns
        .filter(c => {
          const d = new Date(c.check_in_time);
          return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
        })
        .map(c => new Date(c.check_in_time).getDate())
    );

    const days: { day: number; isCurrentMonth: boolean; hasCheckin: boolean; isToday: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, hasCheckin: false, isToday: false });
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
      days.push({ day: d, isCurrentMonth: true, hasCheckin: checkinDates.has(d), isToday });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, hasCheckin: false, isToday: false });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-secondary">Attendance History</h1>
          <p className="text-accent text-lg">Track your consistency and gym visits.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
          <QrCode size={20} />
          CHECK IN
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-primary rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">TOTAL VISITS</h3>
            <CalendarIcon size={20} className="text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">{checkIns.length}</span>
            <span className="text-sm font-medium text-secondary/80">Lifetime</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">THIS WEEK</h3>
            <Clock size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">{thisWeek}</span>
            <span className="text-sm font-medium text-accent">visits</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">CURRENT STREAK</h3>
            <Flame size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">{streak}</span>
            <span className="text-sm font-medium text-accent">days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">CONSISTENCY</h3>
            <Award size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black ${badge.color}`}>{badge.label}</span>
          </div>
          <span className="text-xs font-medium text-accent">{badge.detail}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Dynamic Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
              <h2 className="font-bold text-secondary text-lg">{monthNames[calendarMonth]} {calendarYear}</h2>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-xs font-bold text-secondary py-1">{day}</div>
              ))}
              {calendarDays.map((d, index) => (
                <div
                  key={index}
                  className={`py-2 text-sm font-medium rounded-full transition-colors ${!d.isCurrentMonth ? 'text-gray-300' :
                    d.isToday ? 'bg-secondary text-white shadow-sm' :
                      d.hasCheckin ? 'bg-primary/80 text-secondary shadow-sm' :
                        'text-secondary'
                    }`}
                >
                  {d.day}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs font-medium text-secondary">
                <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                ATTENDED
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-secondary">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                TODAY
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-secondary">
                <div className="w-3 h-3 rounded-full border-2 border-gray-200"></div>
                NO VISIT
              </div>
            </div>
          </div>
        </div>

        {/* Visit Log */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary">VISIT LOG</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-secondary shadow-sm hover:bg-gray-50">
              <Download size={16} /> EXPORT
            </button>
          </div>

          <div className="space-y-4">
            {checkIns.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <CalendarIcon size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-bold text-secondary mb-2">No attendance records yet</h3>
                <p className="text-accent text-sm">Start visiting the gym to build your streak!</p>
              </div>
            ) : (
              checkIns.slice(0, 15).map((log, i) => {
                const date = new Date(log.check_in_time);
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary text-lg">{date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                        <div className="flex items-center gap-2 text-sm text-accent mt-1">
                          <Clock size={14} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-gray-300">•</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.method === 'QR' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {log.method || 'MANUAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-green-600 tracking-wider px-3 py-1 bg-green-50 rounded-full inline-block">ATTENDED</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
