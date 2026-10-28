import { Card } from '@/src/components/ui/Card';
import { useRequests } from '@/src/hooks/useRequests';
import { Zap, Wrench, Clock, MapPin, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';

export default function MyRequests() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { requests, deleteRequest, loading: dataLoading } = useRequests();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const loading = dataLoading;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-navy-900">My Requests</h1>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
          {loading ? '...' : requests.length} Total
        </span>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading requests...</p>
          </motion.div>
        ) : requests.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-16 text-center border border-slate-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">No active requests</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">You haven't requested any emergency services yet. When you do, they'll appear here.</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center px-10 py-4 bg-emerald-500 text-white rounded-[24px] font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
            >
              Get Assistance Now
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {requests.map((request) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="group rounded-[32px] overflow-hidden border-slate-100">
                  <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 ${
                        request.type === 'Charging' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {request.type === 'Charging' ? <Zap size={32} fill="currentColor" /> : <Wrench size={32} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-navy-900 text-lg truncate">
                            {request.type === 'Workshop' ? 'Workshop' : request.type} Assist
                          </h3>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-tight ${
                            request.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="truncate max-w-[200px]">{request.location}</span>
                          </span>
                          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{request.provider.name}</span>
                          <span aria-hidden="true" className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-slate-400">{typeof request.createdAt === 'string' ? new Date(request.createdAt).toLocaleDateString() : 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto gap-10 border-t sm:border-t-0 pt-6 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fee</p>
                        <p className="text-2xl font-bold text-navy-900 tracking-tighter">{request.provider.fee}</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => deleteRequest(request.id)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                          title="Delete Request"
                        >
                          <Trash2 size={22} />
                        </button>
                        <Link 
                          to={`/request-detail/${request.id}`}
                          className="p-3 bg-navy-900 text-white rounded-2xl hover:bg-navy-800 transition-all active:scale-95 shadow-lg shadow-navy-900/10"
                        >
                          <ChevronRight size={22} />
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {request.status !== 'Completed' && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-tight">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active Tracking Available
                      </div>
                      <Link to={`/request-detail/${request.id}`} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                        Go to Tracker <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
