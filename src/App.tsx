import { useState, useEffect } from 'react';
import { LogOut, Menu, Dumbbell } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkUserRole = async (userSession: Session | null) => {
    if (!userSession) {
      setIsAdminMode(false);
      setLoading(false);
      return;
    }

    try {
      // First try to check if the user is in the 'admins' table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userSession.user.id)
        .single();

      if (adminData && !adminError) {
        setIsAdminMode(true);
        setLoading(false);
        return;
      }

      // If not an admin, check if user has a custom role claim or something similar
      const userRole = userSession.user.user_metadata?.role;
      if (userRole === 'admin') {
         setIsAdminMode(true);
      } else {
         setIsAdminMode(false);
      }
    } catch (error) {
       console.error("Error checking user role", error);
       setIsAdminMode(false); // Default to member view on error for safety
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkUserRole(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkUserRole(session);
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
    <BrowserRouter>
      <ScrollToTop />
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
              setIsAdminMode={setIsAdminMode}
              onLogout={() => setShowLogoutModal(true)}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
            <main className="flex-1 overflow-y-auto relative h-full">
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/scanner" element={<AdminScanner />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/communications" element={<AdminNotifications />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <>
            <Sidebar
              setIsAdminMode={setIsAdminMode}
              onLogout={() => setShowLogoutModal(true)}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
            <main className="flex-1 overflow-y-auto relative h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/workouts" element={<WorkoutTracker />} />
                <Route path="/food" element={<FoodTracker />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}
