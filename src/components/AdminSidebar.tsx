import { Dumbbell, LayoutDashboard, Users, ClipboardList, Settings, LogOut, ArrowLeft, QrCode, BarChart3, Bell, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  setIsAdminMode: (isAdmin: boolean) => void;
  onLogout: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function AdminSidebar({ setIsAdminMode, onLogout, mobileMenuOpen, setMobileMenuOpen }: AdminSidebarProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/members', label: 'Members', icon: Users },
    { path: '/admin/scanner', label: 'Attendance', icon: QrCode },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/communications', label: 'Communications', icon: Bell },
    { path: '/admin/plans', label: 'Plans', icon: ClipboardList },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar-light text-white flex flex-col flex-shrink-0 h-screen transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-primary">
              <Dumbbell size={28} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block">Dhaka Fit & Flex</span>
              <span className="text-xs text-primary uppercase tracking-wider font-bold">Admin Panel</span>
            </div>
          </div>
          {setMobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">
              <X size={24} />
            </button>
          )}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen?.(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="text-primary" /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
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
    </>
  );
}
