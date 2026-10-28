import { Zap, Menu, X, Home, Battery, Wrench, Clock, User, LogOut, Shield, Briefcase, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const { user, userProfile, logout, setRole } = useAuth();
  const navigate = useNavigate();

  const role = userProfile?.role || 'user';

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Request Charge', path: '/emergency-charging', icon: Battery },
    { name: 'Find Mechanic', path: '/find-mechanic', icon: Wrench },
    { name: 'Tracking', path: '/my-requests', icon: Clock },
  ];

  const directoryLinks = [
    { name: 'Stations', path: '/charging-directory', icon: Zap },
    { name: 'Mechanics', path: '/mechanic-directory', icon: Search },
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

  const handleRoleChange = async (newRole: any) => {
    try {
      await setRole(newRole);
      setIsMenuOpen(false);
      if (newRole === 'provider') navigate('/provider-dashboard');
      else if (newRole === 'admin') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Zone 1: Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white group-hover:bg-emerald-700 transition-colors shadow-sm">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight whitespace-nowrap">EV Rescue</span>
          </Link>

          {/* Zone 2: Nav Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-emerald-600 ${
                  location.pathname === link.path ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-2" />
            {directoryLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-emerald-600 flex items-center gap-1.5 ${
                  location.pathname === link.path ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <link.icon size={14} />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Action / Profile */}
          <div className="flex items-center gap-4 shrink-0 ml-auto">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 mr-4">
                  {(role === 'provider' || role === 'admin') && (
                    <Link to="/provider-dashboard" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Provider Portal">
                      <Briefcase size={20} />
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link to="/admin-dashboard" className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Admin Control">
                      <Shield size={20} />
                    </Link>
                  )}
                </div>

                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{user.displayName || 'User'}</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">{role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-emerald-200 transition-colors">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Login</Link>
            )}
            <button 
              className="xl:hidden p-2 text-slate-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <div className="py-2 px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      location.pathname === link.path ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <link.icon size={14} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="py-2 px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Directories</p>
              <div className="flex gap-2">
                {directoryLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <link.icon size={14} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {user && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Role Switcher (Demo Only)</p>
                <div className="flex gap-2 px-3 mb-6">
                  {['user', 'provider', 'admin'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        role === r ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50"
                >
                  <User size={20} />
                  My Profile
                </Link>
                {role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-purple-600 hover:bg-purple-50"
                  >
                    <Shield size={20} />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </header>
  );
}
