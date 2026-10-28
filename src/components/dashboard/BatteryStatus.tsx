import React, { useState } from 'react';
import { Battery, Zap, Settings, Info, Check, X, Sliders } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const BatteryStatus: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    currentBattery: userProfile?.currentBattery ?? 24,
    maxRange: userProfile?.maxRange ?? 450,
    vehicleModel: userProfile?.vehicleModel ?? 'Ola S1 Pro'
  });

  const batteryLevel = userProfile?.currentBattery ?? 24;
  const maxRange = userProfile?.maxRange ?? 450;
  const estimatedRange = Math.round((batteryLevel / 100) * maxRange);
  const vehicleModel = userProfile?.vehicleModel ?? 'Vehicle Not Set';

  const handleSave = async () => {
    try {
      await updateUserProfile({
        currentBattery: Number(editData.currentBattery),
        maxRange: Number(editData.maxRange),
        vehicleModel: editData.vehicleModel
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save battery status:', error);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 relative overflow-hidden group">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          title="Adjust Settings"
        >
          {isEditing ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full justify-between"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Battery status</p>
                <h3 className="font-bold text-navy-900 text-lg">{vehicleModel}</h3>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
               <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-navy-900 tracking-tighter">{batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    <span className="text-xs font-bold text-slate-500 tracking-tight">Needs attention soon</span>
                  </div>
               </div>

               <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="#f8fafc"
                      strokeWidth="8"
                    />
                    <motion.circle
                      initial={{ strokeDasharray: "0 1000" }}
                      animate={{ strokeDasharray: `${(batteryLevel / 100) * 264} 1000` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Battery size={24} className="text-emerald-500 mb-1" />
                    <span className="text-[10px] font-bold text-emerald-600">{estimatedRange} km</span>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="p-1 bg-slate-50 rounded-lg text-slate-400">
                   <Info size={14} />
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium leading-tight">
                   Estimated based on your <br />
                   current driving profile.
                 </p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline"
              >
                Refine specs
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Sliders size={20} />
              </div>
              <h3 className="font-bold text-navy-900">Vehicle Specs</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Vehicle Model</label>
                <input 
                  type="text"
                  value={editData.vehicleModel}
                  onChange={(e) => setEditData({ ...editData, vehicleModel: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Tesla Model 3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Battery %</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={editData.currentBattery}
                    onChange={(e) => setEditData({ ...editData, currentBattery: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Max Range (km)</label>
                  <input 
                    type="number"
                    min="0"
                    value={editData.maxRange}
                    onChange={(e) => setEditData({ ...editData, maxRange: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
               <button
                 onClick={() => setIsEditing(false)}
                 className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSave}
                 className="flex-[2] py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
               >
                 <Check size={16} />
                 Update Vehicle
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
