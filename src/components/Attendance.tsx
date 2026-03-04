import { Search, QrCode, Calendar as CalendarIcon, Clock, Flame, Award, ChevronLeft, ChevronRight, CheckCircle2, SlidersHorizontal, Download } from 'lucide-react';

export function Attendance() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-secondary">Attendance History</h1>
          <p className="text-accent text-lg">Track your consistency and gym visits performance.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search sessions..." 
              className="pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
            <QrCode size={20} />
            CHECK IN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-primary rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">TOTAL VISITS</h3>
            <CalendarIcon size={20} className="text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">18</span>
            <span className="text-sm font-medium text-secondary/80">+12% vs last mo</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">AVG. DURATION</h3>
            <Clock size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">72</span>
            <span className="text-sm font-medium text-accent">minutes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">LONGEST STREAK</h3>
            <Flame size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">5</span>
            <span className="text-sm font-medium text-accent">days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">CONSISTENCY</h3>
            <Award size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-secondary">GOLD</span>
            <span className="text-sm font-medium text-accent">Top 10%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
              <h2 className="font-bold text-secondary text-lg">October 2023</h2>
              <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center mb-6">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-xs font-bold text-secondary">{day}</div>
              ))}
              
              {/* Calendar Days Mockup */}
              <div className="text-gray-300 py-2">28</div>
              <div className="text-gray-300 py-2">29</div>
              <div className="text-gray-300 py-2">30</div>
              <div className="py-2 font-medium">1</div>
              <div className="py-2 font-medium">2</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">3</div>
              <div className="py-2 font-medium">4</div>
              
              <div className="py-2 font-medium bg-primary/40 rounded-full text-secondary">5</div>
              <div className="py-2 font-medium">6</div>
              <div className="py-2 font-medium">7</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">8</div>
              <div className="py-2 font-medium">9</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">10</div>
              <div className="py-2 font-medium">11</div>
              
              <div className="py-2 font-medium">12</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">13</div>
              <div className="py-2 font-medium">14</div>
              <div className="py-2 font-medium">15</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">16</div>
              <div className="py-2 font-medium bg-primary/40 rounded-full text-secondary">17</div>
              <div className="py-2 font-medium">18</div>
              
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">19</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">20</div>
              <div className="py-2 font-medium">21</div>
              <div className="py-2 font-medium">22</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">23</div>
              <div className="py-2 font-medium bg-primary/80 rounded-full text-secondary">24</div>
              <div className="py-2 font-medium">25</div>
              
              <div className="py-2 font-medium">26</div>
              <div className="py-2 font-medium">27</div>
              <div className="py-2 font-medium bg-primary rounded-full text-secondary shadow-sm">28</div>
              <div className="py-2 font-medium">29</div>
              <div className="py-2 font-medium">30</div>
              <div className="py-2 font-medium">31</div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm font-medium text-secondary">
                <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                ATTENDED SESSION
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-secondary">
                <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                PARTIAL / SHORT SESSION
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-secondary">
                <div className="w-3 h-3 rounded-full border-2 border-gray-200"></div>
                REST DAY
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary">VISIT LOG</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-secondary shadow-sm hover:bg-gray-50">
                <SlidersHorizontal size={16} /> SORT
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-secondary shadow-sm hover:bg-gray-50">
                <Download size={16} /> EXPORT
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { date: 'Tuesday, Oct 24', time: '06:15 PM - 07:45 PM', type: 'Full Body Session', duration: '1h 30m' },
              { date: 'Monday, Oct 23', time: '07:00 AM - 08:15 AM', type: 'Cardio & Core', duration: '1h 15m' },
              { date: 'Friday, Oct 20', time: '05:30 PM - 07:00 PM', type: 'Upper Body Split', duration: '1h 30m' },
              { date: 'Thursday, Oct 19', time: '06:45 AM - 07:45 AM', type: 'Yoga & Stretching', duration: '1h 00m' },
            ].map((log, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-accent">
                    <CheckCircle2 size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary text-lg">{log.date}</h3>
                    <div className="flex items-center gap-2 text-sm text-accent mt-1">
                      <Clock size={14} /> {log.time}
                      <span className="text-gray-300">•</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{log.type}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-secondary text-xl">{log.duration}</div>
                  <div className="text-xs font-bold text-accent tracking-wider mt-1">COMPLETED</div>
                </div>
              </div>
            ))}
            
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-accent font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors">
              VIEW OLDER HISTORY
            </button>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 pt-6 border-t border-gray-300 flex justify-between items-center text-xs font-bold text-accent">
        <div>© 2023 DHAKA FIT & FLEX PERFORMANCE. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-secondary">TERMS</a>
          <a href="#" className="hover:text-secondary">PRIVACY</a>
          <a href="#" className="hover:text-secondary">CONTACT</a>
        </div>
      </footer>
    </div>
  );
}
