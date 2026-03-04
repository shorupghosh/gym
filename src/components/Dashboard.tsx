import { Dumbbell, Droplet } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-secondary">Welcome Back, Arif</h1>
        <p className="text-accent text-lg">Your performance is looking great this week.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card-light rounded-2xl p-6 border-2 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-secondary mb-1">Quick Check-in</h2>
                <p className="text-sm text-accent">Premium Plan Active</p>
              </div>
              <span className="bg-primary/20 text-secondary text-xs font-semibold px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="flex justify-center mb-8">
              <div className="bg-white p-4 rounded-xl border-4 border-primary shadow-sm inline-block">
                <img alt="Member QR Code" className="w-48 h-48 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7P0B4tDdb25vKSfzCJm-_vOfwODHA7y9rY8PPKNxGanYN53l46tcWTW2NNCGcftM7fHaOwKL6ckT-jxiNcCsrCNo8kIp0P_sqqMBY9dqAqFY3FBq5pRO_KjGL05Ajs3rx_S7F5KgvGldNYRnDcx4BQ8II5NNk0nnxIwmdd9Sj69jXD5nDqOM6DCNatBc-kv-aa4g1k5Vjmgn_t1K4ZgtPMdeaiklZ0XEomNr8HNxRgrG9LBFEqX2yzs9g0utlJWmVLDJJQSxFom8" />
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              <button className="w-full bg-primary hover:bg-primary/90 text-secondary font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">
                Refresh Code
              </button>
              <button className="w-full bg-primary hover:bg-primary/90 text-secondary font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-card-light rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary">Next Reminders</h2>
              <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">View Calendar</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-accent transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Heavy HIIT Training</h3>
                    <p className="text-sm text-accent">Training • Sat - 2:00PM</p>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-secondary text-sm font-semibold py-2 px-4 rounded-full transition-colors shadow-sm">
                  Details
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-accent transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Droplet size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Water Intake Goal</h3>
                    <p className="text-sm text-accent">Water Intake Goal</p>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-secondary text-sm font-semibold py-2 px-4 rounded-full transition-colors shadow-sm">
                  Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-card-light rounded-2xl p-6 shadow-md border border-gray-200 flex-1">
            <h2 className="text-xl font-bold mb-6 text-secondary">Workout Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-4xl font-bold text-secondary mb-2">12</div>
                <div className="text-sm font-medium text-gray-600">Workouts</div>
                <div className="text-xs text-primary mt-1 font-medium">(+2 this month)</div>
              </div>
              <div className="p-4 border-l border-r border-gray-200">
                <div className="text-4xl font-bold text-secondary mb-2">8.4k</div>
                <div className="text-sm font-medium text-gray-600">Calories</div>
                <div className="text-xs text-accent mt-1">(Avg 450/day)</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-secondary mb-2">#04</div>
                <div className="text-sm font-medium text-gray-600">Rank</div>
                <div className="text-xs text-accent mt-1">(Top 5%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
