import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { User, Phone, Calendar, Shield, Camera, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogoutConfirmModal } from '../components/ui/LogoutConfirmModal';

export default function Profile() {
  const { user, userProfile, loading, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsEditingSaving] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phoneNumber || '');
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingSaving(true);
    setMessage(null);

    try {
      await updateUserProfile({
        name,
        phoneNumber: phone,
        photoURL: photoURL
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      setMessage({ type: 'error', text: 'Failed to log out. Please try again.' });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) return null;

  const creationDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
    : 'N/A';

  const provider = user.providerData[0]?.providerId || 'password';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
        <p className="text-slate-500 text-sm font-medium tracking-tight">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar / Photo Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 text-center rounded-[32px]">
            <div className="relative inline-block mx-auto mb-6">
              <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={64} />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors border-2 border-white">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-navy-900 truncate">{userProfile.name}</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">{userProfile.email}</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
              provider === 'google.com' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Shield size={12} />
              {provider === 'google.com' ? 'Google Account' : 'Email Account'}
            </div>
          </Card>

          <Card className="p-6 rounded-[32px]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Joined</span>
                </div>
                <span className="text-xs text-navy-900 font-bold">{creationDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Verified</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold tracking-tight uppercase">Yes</span>
              </div>
            </div>
          </Card>

          <button 
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-red-100 text-red-600 rounded-[24px] font-bold text-sm hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Main Content / Form */}
        <div className="lg:col-span-2">
          <Card className="p-10 rounded-[32px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-navy-900">Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-emerald-600 font-bold text-sm hover:underline transition-all"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-medium ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Full Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50 border-transparent text-slate-700 font-bold' : 'font-bold'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Phone Number</label>
                  <Input
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50 border-transparent text-slate-700 font-bold' : 'font-bold'}
                  />
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Profile Photo URL</label>
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="font-bold"
                    />
                    <p className="text-[10px] text-slate-400 italic px-1">Since storage is limited, please provide a direct image link.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Email Address</label>
                <div className="relative">
                  <Input
                    value={userProfile.email}
                    disabled
                    className="bg-slate-50 border-transparent text-slate-500 pr-12 font-bold"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
                    <Shield size={18} fill="currentColor" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 px-1 font-medium">Email address cannot be changed for security reasons.</p>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4"
                  >
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full md:w-auto px-12 py-4 bg-navy-900 text-white rounded-[24px] font-bold shadow-xl shadow-navy-900/10 hover:bg-navy-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Card>
        </div>
      </div>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
