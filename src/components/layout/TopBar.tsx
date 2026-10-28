import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Bell, X, Check, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useRequests } from '@/src/hooks/useRequests';
import { useLocation as useAppLocation } from '@/src/context/LocationContext';
import { PlaceAutocomplete } from '../PlaceAutocomplete';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { requests } = useRequests();
  const { setManualAddress } = useAppLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/emergency-charging') return 'Emergency Charging';
    if (path === '/workshop-service') return 'Workshop Service';
    if (path === '/my-requests') return 'My Requests';
    if (path === '/profile') return 'Account Settings';
    if (path === '/nearby-providers') return 'Nearby Providers';
    if (path === '/help') return 'Help Center';
    if (path === '/workshop-directory') return 'Workshop Directory';
    if (path === '/charging-directory') return 'Charging Stations';
    return 'EV Rescue';
  };

  const notifications: { id: string; title: string; message: string; time: string; type: string }[] = requests
    .filter(r => r.status !== 'Pending')
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.status,
      message: `${r.provider.name} status: ${r.status}`,
      time: 'Recently',
      type: r.status === 'Completed' ? 'success' : 'info'
    }));

  if (notifications.length === 0) {
    notifications.push(
      { id: 'welcome', title: 'Welcome!', message: 'Welcome to EV Rescue. We are here to help.', time: 'Just now', type: 'info' }
    );
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</p>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <h2 className="text-sm font-bold text-navy-900">{getPageTitle()}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Expandable */}
        <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-80' : 'w-10'}`}>
          {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-2">
              <PlaceAutocomplete 
                onPlaceSelect={(coords, address) => {
                  setManualAddress(address);
                  setIsSearchOpen(false);
                  navigate('/nearby-providers');
                }}
                className="flex-1"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-slate-400 hover:text-navy-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-slate-400 hover:text-navy-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        <div className="w-px h-6 bg-slate-100 mx-2" />

        {/* Location Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
          <MapPin size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Kakinada, AP</span>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2.5 rounded-xl transition-all relative ${
              isNotificationsOpen ? 'bg-navy-900 text-white' : 'text-slate-400 hover:text-navy-900 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-navy-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest">Notifications</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                        notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {notif.type === 'success' ? <Check size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-900 mb-0.5">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-tight">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 text-center">
                <button className="text-[10px] font-bold text-slate-500 hover:text-navy-900 transition-colors uppercase tracking-widest">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User initials bubble */}
        <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center text-navy-900 text-xs font-bold border border-navy-200 uppercase shadow-sm">
          {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'EV'}
        </div>
      </div>
    </header>
  );
}

