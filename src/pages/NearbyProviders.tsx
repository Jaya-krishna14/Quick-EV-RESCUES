import { MapPin, Zap, Clock, RefreshCw, ChevronRight, Star, Navigation, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '@/src/context/LocationContext';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState, useCallback } from 'react';
import { PlaceAutocomplete } from '@/src/components/PlaceAutocomplete';

interface Provider {
  id: string;
  name: string;
  distance: string;
  time: string;
  type: string;
  status: 'Available' | 'Busy';
  rating: number;
  price: string;
  color: string;
  position: { lat: number; lng: number };
}

const PROVIDERS: Provider[] = [
  { 
    id: '1', 
    name: 'GreenCharge Station', 
    distance: '1.2 km', 
    time: '5 min away', 
    type: 'DC Fast', 
    status: 'Available', 
    rating: 4.8, 
    price: '₹12/kWh',
    color: 'emerald',
    position: { lat: 12.9716, lng: 77.5946 }
  },
  { 
    id: '2', 
    name: 'Elite Workshop Service', 
    distance: '2.4 km', 
    time: '8 min away', 
    type: 'Workshop', 
    status: 'Available', 
    rating: 4.9, 
    price: '₹399/service',
    color: 'blue',
    position: { lat: 12.9786, lng: 77.6408 }
  },
  { 
    id: '3', 
    name: 'PowerCharge Point', 
    distance: '4.1 km', 
    time: '12 min away', 
    type: 'AC Fast', 
    status: 'Busy', 
    rating: 4.5, 
    price: '₹8/kWh',
    color: 'purple',
    position: { lat: 12.9352, lng: 77.6245 }
  },
  { 
    id: '4', 
    name: 'VoltWay Hub', 
    distance: '6.8 km', 
    time: '18 min away', 
    type: 'AC', 
    status: 'Available', 
    rating: 4.2, 
    price: '₹6/kWh',
    color: 'orange',
    position: { lat: 12.9254, lng: 77.5891 }
  },
];

export default function NearbyProviders() {
  const { coords, address, isLocating, refreshLocation, setManualAddress } = useLocation();
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const map = useMap();

  useEffect(() => {
    if (coords) {
      setMapCenter(coords);
    }
  }, [coords]);

  const handlePlaceSelect = useCallback((newCoords: { lat: number; lng: number }, newAddress: string) => {
    setMapCenter(newCoords);
    setManualAddress(newAddress);
    if (map) {
      map.panTo(newCoords);
      map.setZoom(15);
    }
  }, [map, setManualAddress]);

  const handleLocateMe = useCallback(() => {
    refreshLocation().then(() => {
      if (coords && map) {
        map.panTo(coords);
        map.setZoom(15);
      }
    });
  }, [refreshLocation, coords, map]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Location Services</p>
          <h1 className="text-4xl font-bold text-navy-900 mb-4 tracking-tight">Help is close by</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-[10px] font-bold text-emerald-700 whitespace-nowrap">
               <MapPin size={12} className="text-emerald-500" />
               Current: {address ? (address.length > 30 ? address.substring(0, 30) + '...' : address) : 'Detecting...'}
             </div>
             <button 
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-[10px] font-bold hover:bg-navy-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <Crosshair size={12} className={isLocating ? 'animate-spin' : ''} />
              {isLocating ? 'Locating...' : 'Use My Current Location'}
            </button>
          </div>
        </div>
        <div className="w-full md:w-96">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 text-right">Search Area</p>
          <PlaceAutocomplete 
            value={address || ''} 
            onInputChange={setManualAddress}
            onPlaceSelect={handlePlaceSelect} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Map View (Left - 3/5) */}
        <div className="lg:col-span-3 h-[600px] bg-emerald-50 rounded-[40px] border border-emerald-100 relative overflow-hidden shadow-2xl">
          <Map
            center={mapCenter}
            zoom={13}
            mapId="DEMO_MAP_ID"
            onCameraChanged={(ev) => setMapCenter(ev.detail.center)}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI
          >
            {/* User Marker */}
            {coords && (
              <AdvancedMarker position={coords} title="You are here">
                <div className="relative">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                    <MapPin size={20} fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-navy-900 px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-bold text-white whitespace-nowrap border border-white/10">
                    Your Location
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Provider Markers */}
            {PROVIDERS.map((p) => (
              <AdvancedMarker 
                key={p.id} 
                position={p.position} 
                title={p.name}
                onClick={() => setSelectedProvider(p)}
              >
                <div className={`w-10 h-10 rounded-[14px] bg-white border-2 border-slate-100 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                  selectedProvider?.id === p.id ? 'ring-4 ring-emerald-500/20 border-emerald-500' : ''
                }`}>
                  <Zap size={18} className={p.status === 'Available' ? 'text-emerald-500' : 'text-orange-500'} fill="currentColor" />
                </div>
              </AdvancedMarker>
            ))}

            {/* Info Window */}
            {selectedProvider && (
              <InfoWindow
                position={selectedProvider.position}
                onCloseClick={() => setSelectedProvider(null)}
                headerDisabled
              >
                <div className="p-4 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-xs">{selectedProvider.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{selectedProvider.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-navy-900">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      {selectedProvider.rating}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      {selectedProvider.price}
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-navy-900 text-white rounded-lg text-[10px] font-bold hover:bg-navy-800 transition-all">
                    Request Help
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>

          {/* Map Controls */}
          <div className="absolute top-8 right-8 flex flex-col gap-3">
            <button 
              onClick={handleLocateMe}
              className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-xl flex items-center justify-center text-navy-900 hover:bg-slate-50 transition-all active:scale-90"
              title="Locate Me"
            >
              <Crosshair size={20} />
            </button>
            <button 
              onClick={() => {
                if (map) {
                  map.setZoom((map.getZoom() || 13) + 1);
                }
              }}
              className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-xl flex items-center justify-center text-navy-900 font-bold hover:bg-slate-50 transition-all active:scale-90"
            >
              +
            </button>
            <button 
              onClick={() => {
                if (map) {
                  map.setZoom((map.getZoom() || 13) - 1);
                }
              }}
              className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-xl flex items-center justify-center text-navy-900 font-bold hover:bg-slate-50 transition-all active:scale-90"
            >
              -
            </button>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-8 left-8 right-8 z-10 pointer-events-none">
            <div className="bg-navy-900/90 backdrop-blur-md p-5 rounded-[24px] flex items-center justify-between text-white border border-white/10 shadow-2xl pointer-events-auto">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Navigation size={20} className={isLocating ? 'animate-spin' : ''} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Searching for</p>
                   <p className="text-xs font-bold tracking-tight">Fastest roadside response team nearby</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* List View (Right - 2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-navy-900 uppercase tracking-widest">Available now</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              Sorted by: <span className="text-navy-900">Proximity</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {PROVIDERS.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ x: 4 }}
                className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm group cursor-pointer hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors`}>
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{p.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                        {p.distance} · {p.time} · {p.type}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition-all">
                    View
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    p.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {p.status}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-navy-900">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {p.rating}
                    </div>
                    <div className="text-xs font-bold text-navy-900">
                      {p.price}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
