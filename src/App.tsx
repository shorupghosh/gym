import { useState, useEffect } from 'react';
import { LogOut, Menu, Dumbbell } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { Profile } from './components/Profile';
import { WorkoutTracker } from './components/WorkoutTracker';
import { FoodTracker } from './components/FoodTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminMembers } from './components/AdminMembers';
import { AdminPlans } from './components/AdminPlans';
import { AdminSettings } from './components/AdminSettings';
import { AdminScanner } from './components/AdminScanner';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AdminNotifications } from './components/AdminNotifications';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [adminView, setAdminView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsAdminMode(true); // Default to admin mode for now
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsAdminMode(true); // Default to admin mode for now
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    setSession(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light text-secondary font-bold text-xl">Loading...</div>;
  }

  if (!session) {
    return <Login onLogin={() => { }} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background-light font-sans text-gray-900 overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar-light text-white flex items-center justify-between p-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-primary" size={24} />
          <span className="font-bold text-lg tracking-tight">Dhaka Fit & Flex</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>
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
              <button onClick={handleLogout} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-secondary hover:bg-primary/90 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}

      {isAdminMode ? (
        <>
          <AdminSidebar
            currentView={adminView}
            setCurrentView={(view) => { setAdminView(view); setMobileMenuOpen(false); }}
            setIsAdminMode={setIsAdminMode}
            onLogout={() => setShowLogoutModal(true)}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <main className="flex-1 overflow-y-auto">
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'members' && <AdminMembers />}
            {adminView === 'scanner' && <AdminScanner />}
            {adminView === 'analytics' && <AdminAnalytics />}
            {adminView === 'communications' && <AdminNotifications />}
            {adminView === 'plans' && <AdminPlans />}
            {adminView === 'settings' && <AdminSettings />}
          </main>
        </>
      ) : (
        <>
          <Sidebar
            currentView={currentView}
            setCurrentView={(view) => { setCurrentView(view); setMobileMenuOpen(false); }}
            setIsAdminMode={setIsAdminMode}
            onLogout={() => setShowLogoutModal(true)}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'attendance' && <Attendance />}
            {currentView === 'workouts' && <WorkoutTracker />}
            {currentView === 'food' && <FoodTracker />}
            {currentView === 'profile' && <Profile />}
          </main>
        </>
      )}
    </div>
  );
}
