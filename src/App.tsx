import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminMembers } from './components/AdminMembers';
import { AdminPlans } from './components/AdminPlans';
import { AdminSettings } from './components/AdminSettings';
import { AdminScanner } from './components/AdminScanner';
import { Login } from './components/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [adminView, setAdminView] = useState('dashboard');

  const handleLogin = (isAdmin: boolean) => {
    setIsAuthenticated(true);
    setIsAdminMode(isAdmin);
    setCurrentView('dashboard');
    setAdminView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background-light font-sans text-gray-900 overflow-hidden relative">
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm max-w-sm w-full mx-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
              <LogOut className="text-2xl text-amber-600" />
            </div>
            <h3 className="text-center text-lg font-bold text-secondary">Confirm Logout</h3>
            <p className="mt-2 text-center text-sm text-accent">Are you sure you want to sign out of your account?</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-accent hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { setShowLogoutModal(false); setIsAuthenticated(false); }} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-secondary hover:bg-primary/90 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}

      {isAdminMode ? (
        <>
          <AdminSidebar currentView={adminView} setCurrentView={setAdminView} setIsAdminMode={setIsAdminMode} onLogout={() => setShowLogoutModal(true)} />
          {adminView === 'dashboard' && <AdminDashboard />}
          {adminView === 'members' && <AdminMembers />}
          {adminView === 'scanner' && <AdminScanner />}
          {adminView === 'plans' && <AdminPlans />}
          {adminView === 'settings' && <AdminSettings />}
        </>
      ) : (
        <>
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} setIsAdminMode={setIsAdminMode} onLogout={() => setShowLogoutModal(true)} />
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'attendance' && <Attendance />}
          {currentView === 'profile' && <Profile />}
        </>
      )}
    </div>
  );
}
