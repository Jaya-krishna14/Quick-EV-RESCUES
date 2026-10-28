import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { MapPin, Zap, Search, Star } from 'lucide-react';
import { useState } from 'react';

const STATIONS = [
  { id: 's1', name: 'Emerald Power Station', location: 'Tech Park Area', type: 'Fast DC', stations: 8, status: 'Active', distance: '1.2 km', rating: 4.9 },
  { id: 's2', name: 'Volt Charging Hub', location: 'Mall Road', type: 'Standard AC', stations: 4, status: 'Active', distance: '2.5 km', rating: 4.5 },
  { id: 's3', name: 'EcoCharge Point', location: 'Subway Plaza', type: 'Fast DC', stations: 2, status: 'Maintenance', distance: '3.8 km', rating: 4.2 },
  { id: 's4', name: 'Hyper Charging Center', location: 'Highway Exit 4', type: 'Supercharger', stations: 12, status: 'Active', distance: '5.2 km', rating: 4.8 },
  { id: 's5', name: 'City Spark Point', location: 'Old Town Square', type: 'Standard AC', stations: 3, status: 'Active', distance: '6.1 km', rating: 4.0 },
];

export default function ChargingDirectory() {
  const [search, setSearch] = useState('');

  const filtered = STATIONS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Charging Directory</h1>
          <p className="text-slate-500">Find permanent charging infrastructure near you</p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by station name or location..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((station) => (
            <Card key={station.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-emerald-600"><Zap size={24} fill="currentColor" /></span>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                  station.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {station.status}
                </div>
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200/50 relative group">
                <img 
                  src="/src/assets/images/charging_station_generic_1793088965676.jpg" 
                  alt={station.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <h3 className="text-lg font-bold text-navy-900 mb-1">{station.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <MapPin size={14} className="text-slate-400" />
                <span>{station.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="text-xs font-bold text-slate-700">{station.type}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ports</p>
                  <p className="text-xs font-bold text-slate-700">{station.stations} Available</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-slate-900">{station.rating}</span>
                </div>
                <span className="text-sm text-slate-400 font-medium">{station.distance}</span>
              </div>

              <Button className="w-full" variant="outline">View Directions</Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
