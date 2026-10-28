import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import Scene3D from '@/src/components/3d/Scene3D';
import { useAuth } from '@/src/context/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInWithGoogleRedirect, loginWithEmail, registerWithEmail, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    setShowRedirectOption(false);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login page Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setMessage({ type: 'info', text: 'Google sign-in was cancelled. Please try again.' });
      } else if (err.code === 'auth/popup-blocked') {
        setShowRedirectOption(true);
      } else {
        setMessage({ type: 'error', text: err.message || 'Google sign-in failed.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to start redirect sign-in.' });
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        if (!name) {
          setMessage({ type: 'error', text: 'Please enter your full name.' });
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match.' });
          setLoading(false);
          return;
        }

        await registerWithEmail(email, password, name);
        setMessage({ type: 'success', text: 'Account created! Welcome to EV Rescue.' });
        setTimeout(() => navigate(from, { replace: true }), 1500);
      }
    } catch (err: any) {
      console.error('Auth error in component:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col lg:flex-row overflow-hidden font-sans relative">
      {/* 3D Background Container */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Scene3D className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900/40 to-transparent" />
      </div>

      {/* Left Side: Branding */}
      <div className="relative z-10 flex-1 flex flex-col items-center lg:items-start justify-center p-12 lg:p-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">EV Rescue</h1>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Elite Roadside Assistance</p>
            </div>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            Your EV companion <br /> 
            <span className="text-emerald-500">on every road.</span>
          </h2>
          
          <p className="text-slate-400 text-lg lg:text-xl max-w-md leading-relaxed mb-12">
            Professional roadside help for electric bikes, scooters, and cars. Rapid response, verified experts, real-time tracking.
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-8">
            <div className="flex flex-col">
              <span className="text-white text-2xl font-bold">15 min</span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center lg:text-left">Avg Response</span>
            </div>
            <div className="w-px h-10 bg-navy-800" />
            <div className="flex flex-col">
              <span className="text-white text-2xl font-bold">100%</span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center lg:text-left">Verified Experts</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12 lg:bg-white/5 lg:backdrop-blur-xl border-l border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-navy-950/50 border border-white/10"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Login to access your EV assistance dashboard' : 'Join the Elite 10 network of EV riders today'}
            </p>
          </div>

          <form onSubmit={handleAuthAction} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-5"
              >
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>
            )}
            
            <Input
              label="Email Address"
              placeholder="rider@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </motion.div>
            )}

            {isLogin && (
              <div className="flex justify-end mt-[-10px]">
                <button type="button" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  Forgot Password?
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {(message || authError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-xl text-sm ${
                    message?.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
                    message?.type === 'info' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}
                >
                  {message?.text || authError}
                  {showRedirectOption && (
                    <button 
                      onClick={handleGoogleRedirectSignIn}
                      className="block mt-2 font-bold underline"
                    >
                      Try Redirect Sign-In instead?
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full py-4" 
              size="lg" 
              isLoading={loading && !authError}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              className="w-full flex gap-3 py-3"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName('');
                  setPassword('');
                  setConfirmPassword('');
                  setMessage(null);
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
