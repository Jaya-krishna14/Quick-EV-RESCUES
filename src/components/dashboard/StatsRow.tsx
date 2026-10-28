import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { BatteryStatus } from './BatteryStatus';

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Battery Status */}
      <BatteryStatus />

      {/* Nearest Charger */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nearest charger</span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-navy-900 tracking-tighter">1.2 km</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
              <Clock size={10} />
              <span>4 min</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">GreenCharge Station · AC Fast</span>
        </div>
        <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
          <MapPin size={32} />
        </div>
      </div>

      {/* Active Requests */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all cursor-pointer">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active requests</span>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-navy-900 tracking-tighter">1</span>
            <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              On the way
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">RapidCharge Pro · 0.8 km away</span>
        </div>
        <div className="w-16 h-16 rounded-[24px] bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
          <Clock size={32} />
        </div>
      </div>
    </div>
  );
}
