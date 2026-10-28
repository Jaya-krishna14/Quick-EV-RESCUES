import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { MapPin, Wrench, ChevronLeft, ShieldCheck, CheckCircle2, Clock, Navigation, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRequests, RescueRequest, RequestStatus } from '@/src/hooks/useRequests';
import { useAuth } from '@/src/context/AuthContext';
import { useLocation } from '@/src/context/LocationContext';
import { PlaceAutocomplete } from '@/src/components/PlaceAutocomplete';

// Removed 3D imports as we're switching to HD images


type Step = 'Form' | 'Providers' | 'Confirm' | 'Status';

interface Provider {
  id: string;
  name: string;
  distance: string;
  type: string;
  availability: string;
  fee: string;
  rating: number;
}

const SAMPLE_MECHANICS: Provider[] = [
  { id: 'm1', name: 'Elite Moto Repairs', distance: '1.8 km', type: 'Mobile Mechanic', availability: '15 min away', fee: '₹499', rating: 4.8 },
  { id: 'm2', name: 'Quick Fix EV', distance: '3.2 km', type: 'Electric Expert', availability: 'Available Now', fee: '₹399', rating: 4.6 },
  { id: 'm3', name: 'Roadside Master', distance: '5.0 km', type: 'General Repair', availability: '25 min away', fee: '₹349', rating: 4.9 },
];

const STATUS_SEQUENCE: RequestStatus[] = ['Pending', 'Accepted', 'Provider on the Way', 'Service Started', 'Completed'];

export default function MechanicFlow() {
  const [step, setStep] = useState<Step>('Form');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: '',
    vehicleType: 'Electric Scooter',
    problem: 'Tire Puncture',
    instructions: '',
  });
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [activeRequest, setActiveRequest] = useState<RescueRequest | null>(null);

  const { coords, address, isLocating, locationError, refreshLocation } = useLocation();

  useEffect(() => {
    if (address) {
      setFormData(prev => ({ ...prev, location: address }));
    }
  }, [address]);

  const { addRequest, updateRequestStatus } = useRequests();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleUseLocation = () => {
    refreshLocation();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location) {
      alert('Please enter your location.');
      return;
    }
    setStep('Providers');
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setStep('Confirm');
  };

  const handleConfirmRequest = async () => {
    if (!selectedProvider || !user) return;

    const requestId = `WRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRequestData = {
      id: requestId,
      type: 'Workshop' as const,
      vehicleType: formData.vehicleType,
      location: formData.location,
      problem: formData.problem,
      instructions: formData.instructions,
      provider: {
        name: selectedProvider.name,
        distance: selectedProvider.distance,
        fee: selectedProvider.fee,
      },
      status: 'Pending' as RequestStatus,
      lat: coords?.lat,
      lng: coords?.lng,
    };

    try {
      await addRequest(newRequestData);
      navigate(`/request-detail/${requestId}`);
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    }
  };

  const handleSimulateNextStatus = async () => {
    if (!activeRequest) return;
    const currentIndex = STATUS_SEQUENCE.indexOf(activeRequest.status);
    if (currentIndex < STATUS_SEQUENCE.length - 1) {
      const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
      try {
        await updateRequestStatus(activeRequest.id, nextStatus);
        setActiveRequest({ ...activeRequest, status: nextStatus });
      } catch (error) {
        console.error('Failed to update status', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {step === 'Form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Workshop Service</h1>
            </div>

            {/* HD Image Hero */}
            <div className="w-full h-64 rounded-[40px] overflow-hidden relative shadow-2xl shadow-navy-900/20 border border-white/5 bg-navy-900">
              <img 
                src="/src/assets/images/hero_mechanic_service_1793014324537.jpg" 
                alt="Professional EV Mechanic" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-8">
                <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-1">Live Status</p>
                <p className="text-white text-sm font-bold">Certified Workshop Experts</p>
              </div>
            </div>


            <Card className="p-10 rounded-[32px]">
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Service Location</p>
                      <PlaceAutocomplete 
                        value={formData.location}
                        onInputChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                        onPlaceSelect={(coords, address) => {
                          setFormData(prev => ({ ...prev, location: address }));
                          // You can also store coords if needed
                        }} 
                      />
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        type="button" 
                        className="flex-1 h-[50px] px-6 flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-blue-500/5"
                        onClick={handleUseLocation}
                        disabled={isLocating}
                      >
                        {isLocating ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Navigation size={18} className="text-blue-600" />
                        )}
                        Use My Current Location
                      </button>
                    </div>
                  </div>

                  {locationError && (
                    <p className="text-xs text-red-500 bg-red-50 p-3 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                      {locationError}
                    </p>
                  )}

                  {coords && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-2 shadow-sm shadow-blue-500/5">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-bold tracking-tight">
                        GPS Locked: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Select
                      label="Vehicle Type"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      options={[
                        { value: 'Electric Scooter', label: 'Electric Scooter' },
                        { value: 'Electric Motorcycle', label: 'Electric Motorcycle' },
                        { value: 'Electric Car', label: 'Electric Car' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      className="font-bold"
                    />
                    <Select
                      label="Issue Type"
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      options={[
                        { value: 'Tire Puncture', label: 'Tire Puncture' },
                        { value: 'Brake Issue', label: 'Brake Issue' },
                        { value: 'Electrical Fault', label: 'Electrical Fault' },
                        { value: 'Chain/Belt Broken', label: 'Chain/Belt Broken' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      className="font-bold"
                    />
                  </div>

                  <Textarea
                    label="Problem Description"
                    placeholder="Please describe the issue in detail..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    required
                    className="font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.95]"
                >
                  Find Workshop Services
                </button>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 'Providers' && (
          <motion.div
            key="providers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('Form')} className="p-2 bg-white rounded-xl border border-slate-200">
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Nearby Workshop Services</h1>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 animate-pulse">
                  <Search size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">Searching Near You</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {coords ? `Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : formData.location}
                  </p>
                </div>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">
                Available Services (Demo Data)
              </p>
              
              {SAMPLE_MECHANICS.map((mechanic) => (
                <Card key={mechanic.id} className="p-6 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-200 transition-all group cursor-pointer">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Wrench size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-navy-900 text-lg">{mechanic.name}</h3>
                        <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">★ {mechanic.rating}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-bold uppercase tracking-tight">
                        <span>{mechanic.distance}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{mechanic.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-emerald-600">{mechanic.availability}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-10 border-t sm:border-t-0 pt-6 sm:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visit Fee</p>
                      <p className="text-2xl font-bold text-navy-900 tracking-tighter">{mechanic.fee}</p>
                    </div>
                    <button 
                      onClick={() => handleSelectProvider(mechanic)}
                      className="px-8 py-3 bg-navy-900 text-white rounded-2xl font-bold hover:bg-navy-800 transition-all active:scale-95 shadow-xl shadow-navy-900/10"
                    >
                      Select
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'Confirm' && selectedProvider && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('Providers')} className="p-2 bg-white rounded-xl border border-slate-200">
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Confirm Request</h1>
            </div>

            <Card className="p-10 rounded-[40px]">
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Vehicle & Problem</h3>
                    <p className="text-xl font-bold text-navy-900">{formData.vehicleType}</p>
                    <p className="text-sm text-slate-500 font-bold mt-1 tracking-tight">{formData.problem}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Service Location</h3>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <p className="text-sm text-slate-700 font-bold leading-relaxed">{formData.location}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Certified Expert</h3>
                      <p className="text-xl font-bold text-navy-900">{selectedProvider.name}</p>
                      <p className="text-xs text-slate-500 font-bold tracking-tight uppercase">{selectedProvider.distance} • Rating: {selectedProvider.rating}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <p className="text-2xl font-bold text-navy-900 tracking-tighter">{selectedProvider.fee}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <button 
                    onClick={handleConfirmRequest} 
                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Request Workshop Assistance
                  </button>
                  <button 
                    onClick={() => setStep('Providers')}
                    className="w-full py-4 bg-white text-slate-500 font-bold rounded-2xl hover:text-navy-900 transition-all"
                  >
                    Go Back & Change
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'Status' && activeRequest && (
          <motion.div
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-10"
          >
            <div>
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-inner ring-4 ring-white shadow-blue-500/10">
                {activeRequest.status === 'Completed' ? <CheckCircle2 size={48} /> : <Clock size={48} className="animate-pulse" />}
              </div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">Service Dispatched!</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Reference: {activeRequest.id}</p>

              {/* HD Image Mini */}
              <div className="w-full h-40 rounded-[32px] overflow-hidden relative shadow-xl shadow-navy-900/10 border border-white/5 mb-8 max-w-xl mx-auto bg-navy-900">
                <img 
                  src="/src/assets/images/hero_mechanic_service_1793014324537.jpg" 
                  alt="Service Status" 
                  className="w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            <Card className="p-10 text-left max-w-xl mx-auto rounded-[40px]">
              <div className="space-y-8">
                {STATUS_SEQUENCE.map((status, idx) => {
                  const isCompleted = STATUS_SEQUENCE.indexOf(activeRequest.status) >= idx;
                  const isActive = activeRequest.status === status;
                  
                  return (
                    <div key={status} className="flex gap-6 relative">
                      {idx !== STATUS_SEQUENCE.length - 1 && (
                        <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${isCompleted && !isActive ? 'bg-blue-500' : 'bg-slate-100'}`} />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm transition-all duration-500 ${
                        isCompleted ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-300'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isCompleted ? 'text-navy-900' : 'text-slate-400'}`}>{status}</p>
                        {isActive && (
                          <motion.p 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1"
                          >
                            Currently here...
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 pt-10 border-t border-slate-50 space-y-4">
                <button 
                  onClick={() => navigate(`/request-detail/${activeRequest.id}`)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Navigation size={16} />
                  Track Order Live on Map
                </button>
                {activeRequest.status !== 'Completed' ? (
                  <button 
                    onClick={handleSimulateNextStatus}
                    className="w-full py-4 bg-navy-900 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-navy-900/10 hover:bg-navy-800 transition-all active:scale-95"
                  >
                    Simulate Next Stage
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Return to Dashboard
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
