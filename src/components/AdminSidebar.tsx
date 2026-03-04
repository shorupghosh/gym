import { Dumbbell, LayoutDashboard, Users, ClipboardList, Settings, LogOut, ArrowLeft, QrCode } from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setIsAdminMode: (isAdmin: boolean) => void;
  onLogout: () => void;
}

export function AdminSidebar({ currentView, setCurrentView, setIsAdminMode, onLogout }: AdminSidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'scanner', label: 'Attendance', icon: QrCode },
    { id: 'plans', label: 'Plans', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar-light text-white flex flex-col flex-shrink-0 h-screen">
      <div className="p-6 flex items-center space-x-3">
        <div className="text-primary">
          <Dumbbell size={28} />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block">Dhaka Fit & Flex</span>
          <span className="text-xs text-primary uppercase tracking-wider font-bold">Admin Panel</span>
        </div>
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
          onClick={() => setIsAdminMode(false)}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Member View</span>
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
