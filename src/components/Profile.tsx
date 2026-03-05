import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

function CustomToggle({ defaultChecked }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div
      onClick={() => setChecked(!checked)}
      className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-[#1A73E8] flex items-center justify-center shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}>
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </div>
    </div>
  );
}

export function Profile() {
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      // Get the current member
      const { data: members } = await supabase.from('members').select('*').order('created_at', { ascending: false }).limit(1);
      setMember(members?.[0]);
    }
    loadData();
  }, []);

  if (!member) return <div className="p-4 sm:p-8">Loading profile...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-secondary mt-4">Profile & Settings</h1>

      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-primary p-1 mb-4 relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}&backgroundColor=ffdfbf`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover bg-orange-100"
            />
            <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-secondary text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap hover:bg-primary/90">
              Upload Photo
            </button>
          </div>
        </div>

        <form className="space-y-5">
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Full Name</label>
            <input
              type="text"
              defaultValue={member.full_name}
              className="w-full border-2 border-accent/40 rounded-lg px-4 py-3 text-secondary font-medium focus:border-secondary focus:ring-0 outline-none"
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Member ID</label>
            <input
              type="text"
              disabled
              defaultValue={member.id}
              className="w-full border-2 border-accent/40 rounded-lg px-4 py-3 text-accent font-medium bg-gray-50 focus:outline-none"
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Email Address</label>
            <input
              type="email"
              defaultValue={member.email || "No email provided"}
              className="w-full border-2 border-accent/40 rounded-lg px-4 py-3 text-secondary font-medium focus:border-secondary focus:ring-0 outline-none"
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Phone Number</label>
            <input
              type="tel"
              defaultValue={member.phone}
              className="w-full border-2 border-accent/40 rounded-lg px-4 py-3 text-secondary font-medium focus:border-secondary focus:ring-0 outline-none"
            />
          </div>

          <div className="pt-6">
            <h3 className="text-secondary font-bold mb-4">Push Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">Workout Reminders</span>
                <CustomToggle defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">Class Updates</span>
                <CustomToggle defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">Promotional Offers</span>
                <CustomToggle defaultChecked={true} />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button type="button" className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Lock size={18} />
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div >
  );
}
