import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DailyData {
    date: string;
    label: string;
    checkIns: number;
    revenue: number;
}

const CHART_COLORS = {
    primary: '#FAB95B',
    secondary: '#1B2A4A',
    accent: '#8B95A5',
    success: '#22C55E',
    danger: '#EF4444',
    purple: '#8B5CF6',
    blue: '#3B82F6',
    orange: '#F97316',
};

const PIE_COLORS = ['#FAB95B', '#1B2A4A', '#3B82F6', '#8B5CF6', '#22C55E', '#F97316'];

export function AdminAnalytics() {
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [planDistribution, setPlanDistribution] = useState<any[]>([]);
    const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
    const [hourlyData, setHourlyData] = useState<any[]>([]);
    const [summaryStats, setSummaryStats] = useState({
        totalRevenue: 0,
        avgDailyCheckIns: 0,
        totalCheckIns: 0,
        peakHour: '',
        revenueGrowth: 0,
        memberGrowth: 0,
        newMembersCount: 0,
    });
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - daysBack);
            startDate.setHours(0, 0, 0, 0);

            // 1. Get attendance data
            const { data: attendance } = await supabase
                .from('attendance')
                .select('check_in_time, method')
                .gte('check_in_time', startDate.toISOString())
                .order('check_in_time', { ascending: true });

            // 2. Get membership history (revenue)
            const { data: history } = await supabase
                .from('membership_history')
                .select('created_at, price_paid, plans(name)')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            // 3. Get members for distribution
            const { data: members } = await supabase.from('members').select('plan, status, created_at');

            // -- Build daily data --
            const dailyMap: Record<string, { checkIns: number; revenue: number }> = {};
            for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().split('T')[0];
                dailyMap[key] = { checkIns: 0, revenue: 0 };
            }

            attendance?.forEach(a => {
                const key = new Date(a.check_in_time).toISOString().split('T')[0];
                if (dailyMap[key]) dailyMap[key].checkIns++;
            });

            history?.forEach(h => {
                const key = new Date(h.created_at).toISOString().split('T')[0];
                if (dailyMap[key]) dailyMap[key].revenue += h.price_paid || 0;
            });

            const daily = Object.entries(dailyMap).map(([date, val]) => ({
                date,
                label: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                checkIns: val.checkIns,
                revenue: val.revenue,
            }));
            setDailyData(daily);

            // -- Hourly distribution --
            const hourMap: Record<number, number> = {};
            for (let h = 5; h <= 23; h++) hourMap[h] = 0;
            attendance?.forEach(a => {
                const hour = new Date(a.check_in_time).getHours();
                if (hourMap[hour] !== undefined) hourMap[hour]++;
            });

            const hourly = Object.entries(hourMap).map(([hour, count]) => ({
                hour: `${String(hour).padStart(2, '0')}:00`,
                checkIns: count,
            }));
            setHourlyData(hourly);

            // -- Plan distribution --
            const planMap: Record<string, number> = {};
            members?.forEach(m => {
                const plan = m.plan || 'Unknown';
                planMap[plan] = (planMap[plan] || 0) + 1;
            });
            setPlanDistribution(Object.entries(planMap).map(([name, value]) => ({ name, value })));

            // -- Status distribution --
            const statusMap: Record<string, number> = {};
            members?.forEach(m => {
                const status = m.status || 'UNKNOWN';
                statusMap[status] = (statusMap[status] || 0) + 1;
            });
            setStatusDistribution(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

            // -- Summary stats --
            const totalRevenue = history?.reduce((sum, h) => sum + (h.price_paid || 0), 0) || 0;
            const totalCheckIns = attendance?.length || 0;
            const avgDailyCheckIns = daily.length > 0 ? Math.round(totalCheckIns / daily.length) : 0;

            // Peak hour
            let peakHour = '';
            let peakCount = 0;
            Object.entries(hourMap).forEach(([hour, count]) => {
                if (count > peakCount) {
                    peakCount = count;
                    peakHour = `${String(hour).padStart(2, '0')}:00`;
                }
            });

            // Growth calculations (compare first half vs second half of period)
            const half = Math.floor(daily.length / 2);
            const firstHalfRev = daily.slice(0, half).reduce((s, d) => s + d.revenue, 0);
            const secondHalfRev = daily.slice(half).reduce((s, d) => s + d.revenue, 0);
            const revenueGrowth = firstHalfRev > 0
                ? Math.round(((secondHalfRev - firstHalfRev) / firstHalfRev) * 100)
                : secondHalfRev > 0 ? 100 : 0;

            // Member growth — compare current period new members vs previous period
            const recentMembers = members?.filter(m => {
                const created = new Date(m.created_at);
                return created >= startDate;
            }).length || 0;

            const previousStart = new Date(startDate);
            previousStart.setDate(previousStart.getDate() - daysBack);
            const previousMembers = members?.filter(m => {
                const created = new Date(m.created_at);
                return created >= previousStart && created < startDate;
            }).length || 0;

            const memberGrowth = previousMembers > 0
                ? Math.round(((recentMembers - previousMembers) / previousMembers) * 100)
                : recentMembers > 0 ? 100 : 0;

            setSummaryStats({
                totalRevenue,
                avgDailyCheckIns,
                totalCheckIns,
                peakHour: peakHour || 'N/A',
                revenueGrowth,
                memberGrowth,
                newMembersCount: recentMembers,
            });

        } catch (err) {
            console.error('Error loading analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const exportAnalyticsCSV = () => {
        const headers = ['Date', 'Check-ins', 'Revenue (BDT)'];
        const rows = dailyData.map(d => [d.date, d.checkIns, d.revenue]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-sm">
                    <p className="font-bold text-secondary mb-1">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }} className="font-medium">
                            {p.name}: {p.name === 'Revenue' ? `৳${p.value.toLocaleString()}` : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight">Analytics & Reports</h1>
                    <p className="text-accent text-sm mt-1">Track your gym's performance with real-time data insights.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range
                                    ? 'bg-primary text-secondary shadow-sm'
                                    : 'text-accent hover:text-secondary'
                                    }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportAnalyticsCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary/90 transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <DollarSign size={20} className="text-green-600" />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${summaryStats.revenueGrowth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {summaryStats.revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(summaryStats.revenueGrowth)}%
                                </span>
                            </div>
                            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Total Revenue</div>
                            <div className="text-3xl font-black text-secondary">৳{summaryStats.totalRevenue.toLocaleString()}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <BarChart3 size={20} className="text-blue-600" />
                                </div>
                                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                                    Avg/Day
                                </span>
                            </div>
                            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Total Check-ins</div>
                            <div className="text-3xl font-black text-secondary">{summaryStats.totalCheckIns} <span className="text-sm text-accent font-medium">({summaryStats.avgDailyCheckIns}/day)</span></div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Calendar size={20} className="text-purple-600" />
                                </div>
                                <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded-full">Peak</span>
                            </div>
                            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Peak Hour</div>
                            <div className="text-3xl font-black text-secondary">{summaryStats.peakHour}</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <Users size={20} className="text-primary" />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${summaryStats.memberGrowth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {summaryStats.memberGrowth >= 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
                                    {summaryStats.memberGrowth >= 0 ? '+' : ''}{summaryStats.memberGrowth}%
                                </span>
                            </div>
                            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">New Members</div>
                            <div className="text-3xl font-black text-secondary">{summaryStats.newMembersCount} <span className="text-sm text-accent font-medium">this period</span></div>
                        </div>
                    </div>

                    {/* Main Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Attendance Trend */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-secondary">Attendance Trends</h2>
                                    <p className="text-xs text-accent mt-0.5">Daily check-in patterns over time</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_COLORS.accent }} interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 3 : 7} />
                                    <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.accent }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="checkIns" name="Check-ins" stroke={CHART_COLORS.primary} fill="url(#colorCheckIns)" strokeWidth={3} dot={timeRange === '7d'} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Plan Distribution Pie */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-secondary mb-2">Plan Distribution</h2>
                            <p className="text-xs text-accent mb-4">Members across plans</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {planDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {planDistribution.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                                        {entry.name} ({entry.value})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Revenue & Hourly Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Revenue Chart */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-secondary">Revenue Overview</h2>
                                    <p className="text-xs text-accent mt-0.5">Daily earnings from new memberships</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_COLORS.accent }} interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 3 : 7} />
                                    <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.accent }} tickFormatter={(v) => `৳${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Hourly Distribution */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-secondary">Hourly Check-in Distribution</h2>
                                    <p className="text-xs text-accent mt-0.5">Peak hours for gym activity</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: CHART_COLORS.accent }} />
                                    <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.accent }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="checkIns" name="Check-ins" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-secondary mb-4">Member Status</h2>
                            <div className="space-y-4">
                                {statusDistribution.map((entry) => {
                                    const total = statusDistribution.reduce((sum, e) => sum + e.value, 0);
                                    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                    const color = entry.name === 'ACTIVE' ? 'bg-green-500' : entry.name === 'EXPIRED' ? 'bg-red-500' : 'bg-gray-400';
                                    return (
                                        <div key={entry.name}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-secondary">{entry.name}</span>
                                                <span className="text-sm font-medium text-accent">{entry.value} ({percent}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-6 shadow-sm text-white">
                            <h2 className="text-xl font-bold mb-4">Quick Insights</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Best Day</p>
                                    <p className="text-lg font-black">
                                        {dailyData.length > 0
                                            ? dailyData.reduce((best, d) => d.checkIns > best.checkIns ? d : best, dailyData[0]).label
                                            : 'N/A'}
                                    </p>
                                    <p className="text-xs text-primary mt-0.5">Highest attendance</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Best Revenue Day</p>
                                    <p className="text-lg font-black">
                                        {dailyData.length > 0
                                            ? dailyData.reduce((best, d) => d.revenue > best.revenue ? d : best, dailyData[0]).label
                                            : 'N/A'}
                                    </p>
                                    <p className="text-xs text-primary mt-0.5">Highest earnings</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Avg Revenue/Member</p>
                                    <p className="text-lg font-black">
                                        ৳{planDistribution.length > 0
                                            ? Math.round(summaryStats.totalRevenue / Math.max(planDistribution.reduce((s, p) => s + p.value, 0), 1)).toLocaleString()
                                            : '0'}
                                    </p>
                                    <p className="text-xs text-primary mt-0.5">Per registered member</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Retention Rate</p>
                                    <p className="text-lg font-black">
                                        {statusDistribution.length > 0
                                            ? `${Math.round((statusDistribution.find(s => s.name === 'ACTIVE')?.value || 0) / Math.max(statusDistribution.reduce((s, e) => s + e.value, 0), 1) * 100)}%`
                                            : 'N/A'}
                                    </p>
                                    <p className="text-xs text-primary mt-0.5">Active / Total members</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
