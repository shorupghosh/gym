import { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}>
        {checked && <span className="text-[10px] font-bold text-secondary">ON</span>}
        {!checked && <span className="text-[10px] font-bold text-gray-500">OFF</span>}
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState({
    autoReminders: true,
    daysBeforeExpiry: 3,
    secondReminder: 1,
    monitorActivity: true,
    inactivityThreshold: 7,
    globalPush: true,
    expiryAlerts: true,
    promoOffers: false,
    classReminders: true,
    facilityAnnouncements: true
  });
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      // Try Supabase first
      const { data } = await supabase.from('automation_settings').select('*').limit(1).single();
      if (data) {
        setSettingsId(data.id);
        setSettings({
          autoReminders: data.automation_enabled ?? true,
          daysBeforeExpiry: data.reminder_days_before_expiry?.[0] ?? 3,
          secondReminder: data.reminder_days_before_expiry?.[1] ?? 1,
          monitorActivity: true,
          inactivityThreshold: data.inactivity_threshold_days ?? 7,
          globalPush: data.push_notifications_enabled ?? true,
          expiryAlerts: data.expiry_alerts ?? true,
          promoOffers: data.promo_offers ?? false,
          classReminders: data.class_reminders ?? true,
          facilityAnnouncements: data.facility_announcements ?? true
        });
      } else {
        // fallback: localStorage 
        const saved = localStorage.getItem('gym_admin_settings');
        if (saved) {
          try { setSettings(JSON.parse(saved)); } catch { }
        }
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    // Save to Supabase
    const payload = {
      automation_enabled: settings.autoReminders,
      reminder_days_before_expiry: [settings.daysBeforeExpiry, settings.secondReminder],
      inactivity_threshold_days: settings.inactivityThreshold,
      push_notifications_enabled: settings.globalPush,
      expiry_alerts: settings.expiryAlerts,
      promo_offers: settings.promoOffers,
      class_reminders: settings.classReminders,
      facility_announcements: settings.facilityAnnouncements,
      updated_at: new Date().toISOString()
    };

    if (settingsId) {
      await supabase.from('automation_settings').update(payload).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('automation_settings').insert([payload]).select().single();
      if (data) setSettingsId(data.id);
    }

    // Also save to localStorage as backup
    localStorage.setItem('gym_admin_settings', JSON.stringify(settings));
    setSavedMessage('Settings saved to database!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 sm:p-8">
      <div className="text-sm text-accent mb-4 flex items-center gap-2">
        <span>Admin Panel</span>
        <span>›</span>
        <span>Settings</span>
        <span>›</span>
        <span className="text-secondary font-medium">Automation & Notifications</span>
      </div>

      <h1 className="text-3xl font-bold text-secondary mb-2">Admin Automation Settings</h1>
      <p className="text-accent mb-8">Configure automated member reminders, inactivity alerts, and push notification rules.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Reminder Days */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-secondary" size={24} />
              <h2 className="text-xl font-bold text-secondary">Reminder Days</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Toggle checked={settings.autoReminders} onChange={val => updateSetting('autoReminders', val)} />
                  <span className="font-medium text-secondary">Enable Automatic Reminders</span>
                </div>
                <p className="text-sm text-accent">Send alerts to members about expiring memberships.</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-medium text-accent mb-1">Days Before Expiry</label>
                  <select
                    value={settings.daysBeforeExpiry}
                    onChange={e => updateSetting('daysBeforeExpiry', parseInt(e.target.value))}
                    className="bg-gray-100 border-none rounded-lg py-2 px-4 text-sm font-medium text-secondary outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-accent mb-1">Second Reminder</label>
                  <select
                    value={settings.secondReminder}
                    onChange={e => updateSetting('secondReminder', parseInt(e.target.value))}
                    className="bg-gray-100 border-none rounded-lg py-2 px-4 text-sm font-medium text-secondary outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>1 Day</option>
                    <option value={0}>None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Inactivity Detection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-secondary" size={24} />
              <h2 className="text-xl font-bold text-secondary">Inactivity Detection</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Toggle checked={settings.monitorActivity} onChange={val => updateSetting('monitorActivity', val)} />
                  <span className="font-medium text-secondary">Monitor Member Activity</span>
                </div>
                <p className="text-sm text-accent">Automatically flag members with no activity.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-accent mb-1">Inactivity Threshold</label>
                <select
                  value={settings.inactivityThreshold}
                  onChange={e => updateSetting('inactivityThreshold', parseInt(e.target.value))}
                  className="bg-gray-100 border-none rounded-lg py-2 px-4 text-sm font-medium text-secondary outline-none focus:ring-2 focus:ring-primary w-48"
                >
                  <option value={7}>7 Days Since Last Visit</option>
                  <option value={14}>14 Days Since Last Visit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Push Notification */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-secondary" size={24} />
              <h2 className="text-xl font-bold text-secondary">Push Notification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Toggle checked={settings.globalPush} onChange={val => updateSetting('globalPush', val)} />
                  <span className="text-sm font-medium text-secondary">Global Push Notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={settings.expiryAlerts} onChange={val => updateSetting('expiryAlerts', val)} />
                  <span className="text-sm font-medium text-secondary">Membership Expiry Alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={settings.promoOffers} onChange={val => updateSetting('promoOffers', val)} />
                  <span className="text-sm font-medium text-accent">Promotional Offers</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Toggle checked={settings.classReminders} onChange={val => updateSetting('classReminders', val)} />
                  <span className="text-sm font-medium text-secondary">Class Booking Reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={settings.facilityAnnouncements} onChange={val => updateSetting('facilityAnnouncements', val)} />
                  <span className="text-sm font-medium text-secondary">Facility Announcements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Bell className="text-secondary" size={20} />
              <h2 className="text-lg font-bold text-secondary">Preview Notification</h2>
            </div>

            <div className="flex-1 flex justify-center items-center mb-8">
              <div className="w-64 h-[500px] bg-secondary rounded-[40px] border-[8px] border-gray-800 relative overflow-hidden shadow-xl">
                {/* Phone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
                </div>

                {/* Phone Status Bar */}
                <div className="absolute top-2 inset-x-6 flex justify-between text-[10px] text-white font-medium">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_4_bar</span>
                    <span className="material-symbols-outlined text-[12px]">wifi</span>
                    <span className="material-symbols-outlined text-[12px]">battery_full</span>
                  </div>
                </div>

                {/* App Content */}
                <div className="mt-20 px-6 text-center">
                  <h3 className="text-white font-bold tracking-widest mb-8">GYM MANAGER</h3>

                  {/* Notification Card */}
                  <div className="bg-white rounded-2xl p-4 text-left shadow-lg">
                    <h4 className="font-bold text-secondary text-sm mb-1">Membership Expiry Alert:</h4>
                    <p className="text-xs text-accent mb-4">Your plan expires in 3 days. Renew now to keep your access!</p>
                    <div className="flex justify-between items-center">
                      <button className="text-xs font-medium text-accent">Dismiss</button>
                      <button className="bg-primary text-secondary text-xs font-bold px-4 py-2 rounded-lg">Renew Now</button>
                    </div>
                  </div>
                </div>

                {/* Phone Home Indicator */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Send size={18} />
              Send Test Notification
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div>
          {savedMessage && <span className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg">{savedMessage}</span>}
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-secondary font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-3 bg-primary text-secondary font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Check size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
