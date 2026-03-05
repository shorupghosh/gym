import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, LogIn, CheckCircle2, X, AlertCircle, Camera, CameraOff, Users, Clock, CalendarCheck, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';

export function AdminScanner() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ name: '', id: '', time: '' });
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [uniqueToday, setUniqueToday] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const scannerContainerId = 'qr-reader';

  // Fetch recent check-ins
  const fetchRecentScans = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in_time,
          method,
          members ( id, full_name, phone, plan, status )
        `)
        .gte('check_in_time', today.toISOString())
        .order('check_in_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      const scans = data || [];
      setRecentScans(scans);
      setTodayCount(scans.length);

      // Count unique members
      const uniqueIds = new Set(scans.map((s: any) => {
        const member = Array.isArray(s.members) ? s.members[0] : s.members;
        return member?.id;
      }));
      setUniqueToday(uniqueIds.size);
    } catch (err) {
      console.error('Error fetching recent scans:', err);
    }
  };

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchRecentScans();

    const channel = supabase.channel('admin_scanner')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        if (mountedRef.current) fetchRecentScans();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      stopScanner();
      supabase.removeChannel(channel);
    };
  }, []);

  const processQrCode = async (decodedText: string) => {
    // Stop scanning temporarily to prevent duplicates
    if (scannerRef.current) {
      try { await scannerRef.current.pause(true); } catch { }
    }

    try {
      // The QR code contains the member ID
      const memberId = decodedText.trim();

      // Look up member by ID or phone
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .or(`id.eq.${memberId},phone.ilike.%${memberId}%`)
        .limit(1);

      if (error) throw error;
      if (!members || members.length === 0) {
        setScannerError('Member not found for scanned QR code.');
        setTimeout(() => {
          setScannerError(null);
          if (scannerRef.current) { try { scannerRef.current.resume(); } catch { } }
        }, 3000);
        return;
      }

      const member = members[0];
      await recordAttendance(member, 'QR');

      // Resume scanning after a delay
      setTimeout(() => {
        if (scannerRef.current) { try { scannerRef.current.resume(); } catch { } }
      }, 3000);
    } catch (err) {
      console.error('Error processing QR:', err);
      setTimeout(() => {
        if (scannerRef.current) { try { scannerRef.current.resume(); } catch { } }
      }, 2000);
    }
  };

  const recordAttendance = async (member: any, method: 'QR' | 'MANUAL') => {
    const { error } = await supabase
      .from('attendance')
      .insert([{ member_id: member.id, method }]);

    if (error) throw error;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToastMessage({ name: member.full_name, id: member.phone, time: timeStr });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);

    fetchRecentScans();
  };

  const startScanner = async () => {
    try {
      setScannerError(null);
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          processQrCode(decodedText);
        },
        () => { /* ignore scan failures */ }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setScannerError(err.message || 'Failed to start camera. Please check permissions.');
      setCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualEntry = async () => {
    if (!searchTerm.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: members, error: searchError } = await supabase
        .from('members')
        .select('*')
        .or(`phone.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(1);

      if (searchError) throw searchError;

      if (!members || members.length === 0) {
        showErrorToast('Member not found. Try a different phone number or name.');
        setIsSubmitting(false);
        return;
      }

      await recordAttendance(members[0], 'MANUAL');
      setSearchTerm('');
    } catch (err) {
      console.error('Error recording attendance:', err);
      showErrorToast('Failed to record attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-secondary tracking-tight text-3xl font-bold leading-tight">Attendance Scanner</h2>
        <p className="text-accent text-base font-normal leading-normal">Scan member QR codes or manually enter details to record attendance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">TODAY'S CHECK-INS</h3>
            <CalendarCheck size={18} className="text-secondary/70" />
          </div>
          <div className="text-4xl font-black text-secondary">{todayCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">UNIQUE MEMBERS</h3>
            <Users size={18} className="text-primary" />
          </div>
          <div className="text-4xl font-black text-secondary">{uniqueToday}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-secondary text-sm tracking-wide">AVG / MEMBER</h3>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="text-4xl font-black text-secondary">{uniqueToday > 0 ? (todayCount / uniqueToday).toFixed(1) : '0'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* QR Scanner */}
          <div className="w-full relative overflow-hidden bg-gray-900 aspect-[4/3] rounded-2xl flex items-center justify-center border border-gray-300 shadow-sm">
            <div id={scannerContainerId} className="w-full h-full" style={{ display: cameraActive ? 'block' : 'none' }}></div>

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")' }}></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <Camera size={48} className="text-primary" />
                  <p className="text-sm font-medium text-gray-300">Camera is inactive</p>
                  <button
                    onClick={startScanner}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-secondary font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Start QR Scanner
                  </button>
                </div>
              </div>
            )}

            {cameraActive && (
              <button
                onClick={stopScanner}
                className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <CameraOff size={16} />
                Stop Scanner
              </button>
            )}

            {scannerError && (
              <div className="absolute top-4 left-4 right-4 z-20 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
                {scannerError}
              </div>
            )}

            {cameraActive && (
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-green-600/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Scanning...
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-secondary text-lg font-bold">Manual Check-in</h3>
            <div className="flex gap-4 items-end">
              <label className="flex flex-col flex-1">
                <span className="text-accent text-sm font-bold pb-2">Member Name or Phone</span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                  className="w-full rounded-xl text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-primary border border-gray-300 bg-white h-12 px-4 text-base placeholder:text-gray-400 transition-colors"
                  placeholder="e.g. Shakib or +88017000"
                />
              </label>
              <button
                onClick={handleManualEntry}
                disabled={isSubmitting || !searchTerm.trim()}
                className="h-12 px-6 bg-primary hover:bg-primary/90 text-secondary rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <LogIn size={18} />
                {isSubmitting ? 'Checking...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-secondary text-lg font-bold">Today's Check-ins</h3>
            <span className="text-xs font-bold bg-primary/20 text-secondary px-3 py-1 rounded-full">{todayCount} total</span>
          </div>
          <div className="overflow-y-auto p-3 flex flex-col gap-1 flex-1">
            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-accent text-sm font-medium">No check-ins today yet.</p>
                <p className="text-xs text-gray-400 mt-1">Start scanning or enter manually.</p>
              </div>
            ) : (
              recentScans.map((scan, i) => {
                const member = Array.isArray(scan.members) ? scan.members[0] : scan.members;
                const timeStr = new Date(scan.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member?.id}&backgroundColor=e5e7eb`} alt={member?.full_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-secondary text-sm font-bold truncate">{member?.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-accent">
                        <Clock size={12} />
                        <span>{timeStr}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${scan.method === 'QR' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                          {scan.method}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex items-start gap-3 max-w-sm z-50 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-green-600" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-secondary text-sm font-bold">Check-in Successful!</h4>
            <p className="text-accent text-sm mt-0.5 font-medium">{toastMessage.name} ({toastMessage.id}) checked in at {toastMessage.time}.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-secondary shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-red-200 shadow-xl rounded-xl p-4 flex items-start gap-3 max-w-sm z-50 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="text-red-600" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-red-800 text-sm font-bold">Error</h4>
            <p className="text-red-600 text-sm mt-0.5 font-medium">{errorToast}</p>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-gray-400 hover:text-red-600 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
