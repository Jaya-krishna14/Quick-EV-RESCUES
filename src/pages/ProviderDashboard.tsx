import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useRequests, RescueRequest, RequestStatus } from '@/src/hooks/useRequests';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { MapPin, Zap, Wrench, CheckCircle2, Clock, AlertCircle, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { updateRequestStatus } = useRequests();
  const [allRequests, setAllRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      } as RescueRequest));
      setAllRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching all requests:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: RequestStatus) => {
    const statusSequence: RequestStatus[] = ['Pending', 'Accepted', 'Provider on the Way', 'Service Started', 'Completed'];
    const currentIndex = statusSequence.indexOf(currentStatus);
    if (currentIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIndex + 1];
      await updateRequestStatus(id, nextStatus);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingRequests = allRequests.filter(r => r.status === 'Pending');
  const activeRequests = allRequests.filter(r => r.status !== 'Pending' && r.status !== 'Completed');
  const completedRequests = allRequests.filter(r => r.status === 'Completed');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Provider Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage incoming emergency service requests</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Jobs</p>
              <p className="text-xl font-bold text-emerald-600">{activeRequests.length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-bold text-amber-600">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: New Requests */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-amber-500" />
              <h2 className="font-bold text-slate-800">Incoming Requests</h2>
            </div>
            
            <AnimatePresence mode="popLayout">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">No new requests at the moment.</p>
              ) : (
                pendingRequests.map(request => (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="p-5 border-l-4 border-l-amber-500">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${request.type === 'Charging' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {request.type === 'Charging' ? <Zap size={20} fill="currentColor" /> : <Wrench size={20} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{request.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{request.type} Assist</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <MapPin size={14} />
                        <span className="truncate">{request.location}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Issue</p>
                        <p className="text-xs font-medium text-slate-700">{request.problem}</p>
                      </div>
                      <Button 
                        onClick={() => handleUpdateStatus(request.id, request.status)}
                        className="w-full" 
                        size="sm"
                      >
                        Accept Request
                      </Button>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Column 2: Active Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-emerald-500" />
              <h2 className="font-bold text-slate-800">Active Service Jobs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {activeRequests.length === 0 ? (
                  <div className="md:col-span-2 py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">All caught up! No active jobs.</p>
                  </div>
                ) : (
                  activeRequests.map(request => (
                    <motion.div
                      key={request.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                            request.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {request.status}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{request.provider.fee}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
                            <p className="font-bold text-slate-900">ID: {request.userId.substring(0, 8)}</p>
                          </div>
                          <button className="ml-auto p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                            <Phone size={18} />
                          </button>
                        </div>

                        <div className="space-y-4 flex-1">
                          <div className="flex gap-3">
                            <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 leading-relaxed">{request.location}</p>
                          </div>
                          <div className="flex gap-3">
                            <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 leading-relaxed">{request.problem}</p>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <Button 
                            onClick={() => handleUpdateStatus(request.id, request.status)}
                            className="w-full"
                          >
                            Move to Next Stage
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Recently Completed */}
            {completedRequests.length > 0 && (
              <div className="mt-12">
                <h2 className="font-bold text-slate-800 mb-4">Recently Completed</h2>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {completedRequests.slice(0, 5).map(request => (
                        <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-900">{request.id}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{request.type}</td>
                          <td className="px-6 py-4 text-xs font-bold text-emerald-600">{request.provider.fee}</td>
                          <td className="px-6 py-4 text-xs text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
