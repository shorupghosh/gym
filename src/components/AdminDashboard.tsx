import { Search, Bell, QrCode, Users, Clock, DollarSign, Zap } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light">
      <header className="h-20 flex items-center justify-between px-8 bg-background-light shrink-0">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search members or data..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center space-x-6">
          <button className="bg-primary hover:bg-primary/90 text-secondary font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
            <QrCode size={18} />
            QUICK CHECK-IN
          </button>
          <button className="text-accent hover:text-secondary transition-colors relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background-light"></span>
          </button>
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="text-right">
              <div className="font-bold text-sm text-secondary">Mahmudul Hasan</div>
              <div className="text-xs text-primary font-bold uppercase">Admin</div>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mahmudul&backgroundColor=b6e3f4" alt="Admin" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 pt-0">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-secondary mb-2 tracking-tight">System Overview</h1>
          <p className="text-accent text-lg italic">Performance analytics for <span className="text-primary font-semibold not-italic">Dhaka Fit & Flex</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">+12.4%</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Active Members</div>
            <div className="text-4xl font-black text-secondary mb-4">1,284</div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">Urgent</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Expiring Soon</div>
            <div className="text-4xl font-black text-secondary mb-4">42</div>
            <div className="text-xs font-medium text-secondary">Action required for renewals</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <DollarSign size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">+8.2%</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Revenue (MTD)</div>
            <div className="text-4xl font-black text-secondary mb-4">৳12,45,000</div>
            <div className="text-xs font-medium text-primary">Target: ৳15,00,000</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full">LIVE</span>
            </div>
            <div className="text-xs font-bold text-accent tracking-wider uppercase mb-1">Check-ins Today</div>
            <div className="text-4xl font-black text-secondary mb-4">156</div>
            <div className="text-xs font-medium text-secondary">Peak activity detected</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-secondary">Attendance Intensity</h2>
                <p className="text-xs font-bold text-accent tracking-wider uppercase mt-1">Hourly Density by Weekday</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className="px-4 py-1.5 text-sm font-bold text-accent rounded-md">7D</button>
                <button className="px-4 py-1.5 text-sm font-bold text-secondary bg-primary rounded-md shadow-sm">30D</button>
              </div>
            </div>
            
            <div className="h-64 flex flex-col justify-between relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="text-6xl font-black text-secondary">CHART AREA</div>
              </div>
              <div className="flex justify-between text-xs font-bold text-secondary">
                <span>04</span><span>08</span><span>12</span><span>16</span><span>20</span><span>00</span>
              </div>
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4 text-xs font-bold text-secondary">
                  <span className="w-8">MON</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="w-1/4 bg-primary/30"></div>
                    <div className="w-1/4 bg-primary/60"></div>
                    <div className="w-1/4 bg-primary"></div>
                    <div className="w-1/4 bg-primary/40"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-secondary">
                  <span className="w-8">TUE</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="w-1/3 bg-primary/40"></div>
                    <div className="w-1/3 bg-primary/80"></div>
                    <div className="w-1/3 bg-primary/20"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-secondary">
                  <span className="w-8">WED</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="w-1/2 bg-primary/50"></div>
                    <div className="w-1/4 bg-primary"></div>
                    <div className="w-1/4 bg-primary/30"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <div className="w-3 h-3 rounded-full bg-primary/30"></div> QUIET
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <div className="w-3 h-3 rounded-full bg-primary/60"></div> MODERATE
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <div className="w-3 h-3 rounded-full bg-primary"></div> PEAK
                </div>
              </div>
              <div className="text-xs font-bold text-primary italic">LIVE UPDATES ENABLED</div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-0 shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary">Live Activity</h2>
              <span className="bg-orange-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> ACTIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {[
                { name: 'Sadia Rahman', action: 'Checked in', detail: 'Gulshan Branch', time: '2M AGO', img: 'Sadia' },
                { name: 'Tanvir Ahmed', action: 'Checked in', detail: 'Banani Branch', time: '14M AGO', img: 'Tanvir' },
                { name: 'Rakib Hasan', action: 'MEMBERSHIP ALERT', detail: '', time: '25M AGO', img: 'Rakib', alert: true },
                { name: 'Nusrat Jahan', action: 'Joined', detail: 'Dhanmondi Branch', time: '45M AGO', img: 'Nusrat' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.img}&backgroundColor=f3f4f6`} alt={activity.name} className="w-12 h-12 rounded-xl border border-gray-200" />
                  <div className="flex-1">
                    <h4 className="font-bold text-secondary text-sm">{activity.name}</h4>
                    <p className="text-xs text-accent mt-0.5">
                      {activity.alert ? (
                        <span className="text-primary font-bold">{activity.action}</span>
                      ) : (
                        <>
                          {activity.action} • <span className="italic text-primary">{activity.detail}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-secondary">{activity.time}</div>
                </div>
              ))}
            </div>
            <button className="p-4 border-t border-gray-100 text-xs font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-wider text-center w-full rounded-b-2xl">
              Expand All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
