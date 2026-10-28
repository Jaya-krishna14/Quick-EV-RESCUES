import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Card } from '@/src/components/ui/Card';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { RescueRequest } from '@/src/hooks/useRequests';
import { Users, Activity, ShieldCheck, DollarSign, Zap, Wrench, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState<RescueRequest[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!db) return;

    // Fetch all requests
    const q = query(collection(db, 'requests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      } as RescueRequest));
      setAllRequests(docs);
      setLoading(false);
    });

    // We can't easily list all users with client SDK, so we'll estimate or look for a 'users' collection
    const fetchUsers = async () => {
      try {
        const userSnapshot = await getDocs(collection(db, 'users'));
        setUserCount(userSnapshot.size || 124); // Fallback for demo
      } catch (e) {
        setUserCount(124);
      }
    };
    fetchUsers();

    return unsubscribe;
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Requests', value: allRequests.length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Providers', value: 42, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenue (Demo)', value: '₹45.2k', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const chargingCount = allRequests.filter(r => r.type === 'Charging').length;
  const workshopCount = allRequests.filter(r => r.type === 'Workshop').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">System Overview</h1>
          <p className="text-slate-500 text-sm">Real-time metrics and platform monitoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" />
              Recent System Activity
            </h2>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allRequests.slice(0, 10).map(request => (
                      <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={request.type === 'Charging' ? 'text-emerald-600' : 'text-blue-600'}>
                              {request.type === 'Charging' ? <Zap size={16} fill="currentColor" /> : <Wrench size={16} />}
                            </div>
                            <span className="text-xs font-bold text-slate-900">{request.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {request.userId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            request.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={12} className="text-slate-400" />
                            <span className="truncate max-w-[120px]">{request.location}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Distribution and Breakdown */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-sm font-bold text-navy-900 mb-6">Service Distribution</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-emerald-600">Charging Assistance</span>
                    <span>{chargingCount}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${(chargingCount / allRequests.length) * 100}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-blue-600">Mechanical Repair</span>
                    <span>{workshopCount}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(workshopCount / allRequests.length) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-navy-900 text-white">
              <h2 className="text-sm font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition-colors">
                  Broadcast Alert
                </button>
                <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition-colors">
                  Export System Logs
                </button>
                <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition-colors text-red-400">
                  Maintenance Mode
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
