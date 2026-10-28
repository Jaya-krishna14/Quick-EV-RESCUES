import React, { useState } from 'react';
import { 
  Zap, 
  LayoutDashboard, 
  Battery, 
  Wrench, 
  Clock, 
  MapPin, 
  User, 
  HelpCircle, 
  LogOut,
  MoreHorizontal,
  MessageCircle,
  Search
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useRequests } from '@/src/hooks/useRequests';
import { useChat } from '@/src/context/ChatContext';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { requests } = useRequests();
  const { setIsChatOpen } = useChat();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeCount = requests.filter(r => r.status !== 'Completed').length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Emergency Charging', path: '/emergency-charging', icon: Battery },
    { name: 'Workshop Service', path: '/workshop-service', icon: Wrench },
    { name: 'My Requests', path: '/my-requests', icon: Clock, badge: activeCount > 0 ? activeCount : undefined },
    { name: 'Nearby Providers', path: '/nearby-providers', icon: MapPin },
  ];

  const accountItems = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Help Center', path: '/help', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-navy-900 h-screen flex flex-col border-r border-navy-800 sticky top-0 overflow-y-auto no-scrollbar">
      {/* Brand */}
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">EV Rescue</h1>
            <p className="text-emerald-400/80 text-[10px] font-medium tracking-tight uppercase">Charge · Repair · Get Moving</p>
          </div>
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-8">
        <div className="bg-navy-800/50 rounded-2xl p-3 border border-navy-700/50 flex items-center justify-between group hover:bg-navy-800 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                userProfile?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm truncate">{userProfile?.name || 'EV Rider'}</p>
              <p className="text-slate-400 text-[10px] truncate">EV rider · Kakinada</p>
            </div>
          </div>
          <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Main Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white transition-colors'} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Workshop Directory Link */}
            <Link
              to="/workshop-directory"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                location.pathname === '/workshop-directory' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Search size={20} className={location.pathname === '/workshop-directory' ? 'text-white' : 'group-hover:text-white transition-colors'} />
              <span className="text-sm font-bold">Workshop Directory</span>
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Account</p>
          <div className="space-y-1">
            {accountItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-navy-800 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white transition-colors'} />
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* Chat Promo */}
        <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden group hover:bg-emerald-900/40 transition-colors">
          <div className="relative z-10 flex flex-col">
            <p className="text-white text-xs font-bold mb-1">Need a hand?</p>
            <p className="text-emerald-300 text-[10px] mb-3">Our team is online 24/7</p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg self-end transition-colors shadow-lg shadow-emerald-500/20"
            >
              Chat
            </button>
          </div>
          <div className="absolute top-0 right-0 p-3 opacity-20 text-emerald-500">
            <MessageCircle size={32} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-all group"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold">Log out</span>
        </button>
      </div>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </aside>
  );
}
