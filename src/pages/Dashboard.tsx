import { Zap, Wrench, ChevronRight, ArrowRight, Clock, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Scene3D from '@/src/components/3d/Scene3D';
import { useAuth } from '@/src/context/AuthContext';
import { useLocation } from '@/src/context/LocationContext';
import { StatsRow } from '@/src/components/dashboard/StatsRow';

const NEARBY_PROVIDERS = [
  { id: 'p1', name: 'RapidCharge Mobile', type: 'Charging', address: 'MG Road, Bangalore' },
  { id: 'p2', name: 'EV Rescue Pro', type: 'Workshop', address: 'Indiranagar, Bangalore' },
  { id: 'p3', name: 'VoltSupport', type: 'Charging', address: 'Koramangala, Bangalore' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { address, isLocating, refreshLocation } = useLocation();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <section className="relative h-[340px] rounded-[32px] overflow-hidden bg-navy-900 flex items-center">
        <div className="absolute inset-0 z-0">
          <Scene3D className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/60 to-transparent" />
        </div>
        
        <div className="relative z-10 px-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
              Sunday, October 25, 2026
            </p>
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <button 
              onClick={refreshLocation}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              <Navigation size={10} className={isLocating ? 'animate-spin' : ''} />
              {address ? address.split(',')[0] : 'Detecting Location...'}
            </button>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Your EV companion <br /> on every road.
          </h1>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            Fast help when your battery is low or your journey takes an unexpected turn.
          </p>
        </div>

        {/* Illustration overlay (simplified representation) */}
        <div className="absolute right-12 bottom-12 hidden lg:block">
           <div className="relative w-64 h-32">
              <div className="absolute bottom-0 left-0 w-full h-4 bg-navy-800/50 rounded-full blur-xl" />
              {/* This would ideally be a real SVG illustration like in the screenshot */}
              <div className="bg-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center text-white absolute bottom-4 left-1/2 -translate-x-1/2 shadow-xl shadow-emerald-500/20">
                <Zap size={24} fill="currentColor" />
              </div>
           </div>
        </div>
      </section>

      {/* Stats row */}
      <StatsRow />

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
            <h2 className="text-xl font-bold text-navy-900">How can we help?</h2>
          </div>
          <button 
            onClick={() => navigate('/nearby-providers')}
            className="flex items-center gap-2 text-slate-500 hover:text-navy-900 transition-colors text-xs font-bold"
          >
            View all providers <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Charging Action */}
          <button 
            onClick={() => navigate('/emergency-charging')}
            className="group relative bg-navy-900 rounded-[28px] p-8 text-left overflow-hidden transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-emerald-500/10 min-h-[200px]"
          >
            <img 
              src="/src/assets/images/charging_service_hero_1793088915714.jpg" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" 
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/60 via-navy-900/40 to-navy-900/80 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Emergency charging</h3>
              <p className="text-emerald-50 text-sm max-w-[240px] opacity-90 font-medium">Get a mobile charge or find a nearby station</p>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-white/50 group-hover:translate-x-2 transition-all">
              <ArrowRight size={32} />
            </div>
          </button>

          {/* Find a Mechanic Action */}
          <button 
            onClick={() => navigate('/workshop-service')}
            className="group relative bg-navy-900 rounded-[28px] p-8 text-left overflow-hidden transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-blue-600/10 min-h-[200px]"
          >
            <img 
              src="/src/assets/images/mechanic_service_hero_1793088930020.jpg" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" 
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-navy-900/40 to-navy-900/80 pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
                <Wrench size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Workshop service</h3>
              <p className="text-blue-50 text-sm max-w-[240px] opacity-90 font-medium">Get professional care from certified EV experts</p>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-white/50 group-hover:translate-x-2 transition-all">
              <ArrowRight size={32} />
            </div>
          </button>
        </div>
      </section>

      {/* Lists Section (Live Request & Nearby) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Request</p>
          <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Clock size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium">No live requests at the moment</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nearby Now</p>
          <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm min-h-[200px]">
            <div className="flex flex-col gap-4">
               {NEARBY_PROVIDERS.map(provider => (
                 <div 
                  key={provider.id} 
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/nearby-providers')}
                >
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      {provider.type === 'Charging' ? <Zap size={18} fill="currentColor" /> : <Wrench size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-navy-900">{provider.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <MapPin size={10} /> {provider.address}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-navy-900 transition-colors" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
