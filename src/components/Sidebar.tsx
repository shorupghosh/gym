import { Dumbbell, LayoutDashboard, CalendarCheck, User, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setIsAdminMode: (isAdmin: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({ currentView, setCurrentView, setIsAdminMode, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-sidebar-light text-white flex flex-col flex-shrink-0 h-screen">
      <div className="p-6 flex items-center space-x-3">
        <div className="text-primary">
          <Dumbbell size={28} />
        </div>
        <span className="text-xl font-bold tracking-tight">Dhaka Fit & Flex</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 space-y-2">
        <button 
          onClick={() => setIsAdminMode(true)}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Shield size={20} />
          <span className="font-medium">Admin Panel</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
