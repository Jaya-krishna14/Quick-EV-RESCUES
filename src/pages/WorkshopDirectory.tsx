import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { MapPin, Wrench, Search, Star, Phone } from 'lucide-react';
import { useState } from 'react';

const MECHANICS = [
  { id: 'm1', name: 'Elite Moto Repairs', location: 'Tech Park Area', specialty: 'Electric Powertrain', experience: '8 Years', rating: 4.8, distance: '1.8 km', status: 'Available' },
  { id: 'm2', name: 'Quick Fix EV', location: 'Mall Road', specialty: 'Battery & Brakes', experience: '5 Years', rating: 4.6, distance: '3.2 km', status: 'Available' },
  { id: 'm3', name: 'Roadside Master', location: 'Subway Plaza', specialty: 'General Repair', experience: '12 Years', rating: 4.9, distance: '5.0 km', status: 'Busy' },
  { id: 'm4', name: 'Volt Expert Studio', location: 'Highway Exit 4', specialty: 'Electrical Diagnostics', experience: '6 Years', rating: 4.7, distance: '7.2 km', status: 'Available' },
  { id: 'm5', name: 'Biker Rescue Hub', location: 'Old Town Square', specialty: 'Tires & Suspension', experience: '10 Years', rating: 4.4, distance: '9.1 km', status: 'Available' },
];

export default function MechanicDirectory() {
  const [search, setSearch] = useState('');

  const filtered = MECHANICS.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Workshop Directory</h1>
          <p className="text-slate-500">Certified professionals for your electric vehicle</p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by workshop name or specialty..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((mechanic) => (
            <Card key={mechanic.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Wrench size={24} />
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                  mechanic.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {mechanic.status}
                </div>
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200/50 relative group">
                <img 
                  src="/src/assets/images/mechanic_workshop_generic_1793088981943.jpg" 
                  alt={mechanic.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <h3 className="text-lg font-bold text-navy-900 mb-1">{mechanic.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <MapPin size={14} className="text-slate-400" />
                <span>{mechanic.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialty</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{mechanic.specialty}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exp.</p>
                  <p className="text-xs font-bold text-slate-700">{mechanic.experience}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-slate-900">{mechanic.rating}</span>
                </div>
                <span className="text-sm text-slate-400 font-medium">{mechanic.distance}</span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="secondary">Book Appointment</Button>
                <Button variant="outline" size="sm">
                  <Phone size={18} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
