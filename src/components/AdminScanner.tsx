import { useState } from 'react';
import { Video, LogIn, CheckCircle2, X } from 'lucide-react';

export function AdminScanner() {
  const [showToast, setShowToast] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-secondary tracking-tight text-3xl font-bold leading-tight">Attendance Scanner</h2>
        <p className="text-accent text-base font-normal leading-normal">Scan member QR codes or manually enter ID to record attendance.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="w-full relative overflow-hidden bg-gray-200 aspect-[4/3] rounded-2xl flex items-center justify-center border border-gray-300 shadow-sm">
            <div className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-80" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")' }}></div>
            <div className="absolute w-64 h-64 border-2 border-primary/50 rounded-xl flex items-center justify-center relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
              <div className="w-full h-0.5 bg-primary/80 absolute top-1/2 left-0 shadow-[0_0_10px_2px_rgba(250,185,91,0.5)]"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 text-secondary px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-sm">
              <Video size={16} className="text-primary" />
              Camera Active
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-secondary text-lg font-bold">Manual Member Entry</h3>
            <div className="flex gap-4 items-end">
              <label className="flex flex-col flex-1">
                <span className="text-accent text-sm font-bold pb-2">Member ID</span>
                <input 
                  className="w-full rounded-xl text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-primary border border-gray-300 bg-white h-12 px-4 text-base placeholder:text-gray-400 transition-colors" 
                  placeholder="e.g. MEM-12345" 
                />
              </label>
              <button className="h-12 px-6 bg-primary hover:bg-primary/90 text-secondary rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                <LogIn size={18} />
                Submit
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-secondary text-lg font-bold">Recently Scanned</h3>
            <span className="text-xs font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-full">Today: 42</span>
          </div>
          <div className="overflow-y-auto p-3 flex flex-col gap-1">
            {[
              { name: 'Sadia Rahman', id: 'MEM-8472', time: '2 mins ago', img: 'Sadia' },
              { name: 'Mehedi Hasan', id: 'MEM-9102', time: '15 mins ago', img: 'Mehedi' },
              { name: 'Eshita Rahman', id: 'MEM-3391', time: '28 mins ago', img: 'Eshita' },
              { name: 'Fahim Chowdhury', id: 'MEM-1145', time: '1 hr ago', img: 'Fahim' },
            ].map((scan, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${scan.img}&backgroundColor=e5e7eb`} alt={scan.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-secondary text-sm font-bold truncate">{scan.name}</p>
                  <p className="text-accent text-xs font-medium truncate">{scan.id} • {scan.time}</p>
                </div>
                <CheckCircle2 className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 mt-auto">
            <button className="w-full py-2 text-sm font-bold text-accent hover:text-primary transition-colors">View All History</button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex items-start gap-3 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-green-600" size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-secondary text-sm font-bold">Scan Successful</h4>
            <p className="text-accent text-sm mt-0.5 font-medium">Sadia Rahman (MEM-8472) logged in at 09:42 AM.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-secondary shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
