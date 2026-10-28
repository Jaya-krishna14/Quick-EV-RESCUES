import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ChevronLeft, Zap, Wrench, MapPin, Clock, CheckCircle2, Phone, MessageSquare, AlertCircle, Star, Navigation, Crosshair } from 'lucide-react';
import { useRequests, RescueRequest, RequestStatus } from '@/src/hooks/useRequests';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

const STATUS_SEQUENCE: RequestStatus[] = ['Pending', 'Accepted', 'Provider on the Way', 'Service Started', 'Completed'];

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { requests, updateRequestStatus, updateWorkerLocation, addRequestReview, loading: dataLoading } = useRequests();
  
  const [request, setRequest] = useState<RescueRequest | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id && requests.length > 0) {
      const found = requests.find(r => r.id === id);
      if (found) {
        setRequest(found);
      }
    }
  }, [id, requests]);

  const handleSimulateNextStatus = async () => {
    if (!request) return;
    const currentIndex = STATUS_SEQUENCE.indexOf(request.status);
    if (currentIndex < STATUS_SEQUENCE.length - 1) {
      const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
      try {
        await updateRequestStatus(request.id, nextStatus);
        
        // If moving to "Provider on the Way", initialize worker location if not present
        if (nextStatus === 'Provider on the Way' && !request.workerLocation && request.lat && request.lng) {
          // Start worker 2km away
          const startLoc = {
            lat: request.lat + 0.015,
            lng: request.lng + 0.015
          };
          await updateWorkerLocation(request.id, startLoc);
        }
      } catch (error) {
        console.error('Failed to update status', error);
      }
    }
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
    } else {
      if (!request?.workerLocation || !request.lat || !request.lng) return;
      
      setIsSimulating(true);
      simulationInterval.current = setInterval(async () => {
        setRequest(currentReq => {
          if (!currentReq?.workerLocation || !currentReq.lat || !currentReq.lng) return currentReq;
          
          const destLat = currentReq.lat;
          const destLng = currentReq.lng;
          const currLat = currentReq.workerLocation.lat;
          const currLng = currentReq.workerLocation.lng;
          
          // Move 5% closer each step
          const nextLat = currLat + (destLat - currLat) * 0.05;
          const nextLng = currLng + (destLng - currLng) * 0.05;
          
          const newLoc = { lat: nextLat, lng: nextLng };
          
          // Update Firebase in the background
          updateWorkerLocation(currentReq.id, newLoc);
          
          // Check if arrived (close enough)
          if (Math.abs(destLat - nextLat) < 0.0001 && Math.abs(destLng - nextLng) < 0.0001) {
             if (simulationInterval.current) clearInterval(simulationInterval.current);
             setIsSimulating(false);
             updateRequestStatus(currentReq.id, 'Service Started');
          }
          
          return { ...currentReq, workerLocation: newLoc };
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, []);

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!request) return;
    setSubmittingReview(true);
    try {
      await addRequestReview(request.id, rating, review);
    } catch (error) {
      console.error('Failed to submit review', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || (dataLoading && !request)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">Request Not Found</h1>
        <p className="text-slate-500">We couldn't find the request you're looking for.</p>
        <button 
          onClick={() => navigate('/my-requests')}
          className="px-8 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-all"
        >
          Back to My Requests
        </button>
      </div>
    );
  }

  const showTrackingMap = request.status === 'Accepted' || request.status === 'Provider on the Way' || request.status === 'Service Started';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/my-requests')} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Request Tracker</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref ID: {request.id}</p>
          </div>
        </div>
        {request.status === 'Provider on the Way' && (
           <button 
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isSimulating ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            {isSimulating ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Stop Live Simulation
              </>
            ) : (
              <>
                <Navigation size={14} className="text-emerald-500" />
                Simulate Worker Live Movement
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracker Status & Map */}
        <div className="lg:col-span-2 space-y-8">
          
          <AnimatePresence>
            {showTrackingMap && request.lat && request.lng && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-[400px] w-full rounded-[40px] overflow-hidden border border-slate-100 shadow-xl shadow-navy-900/5 relative"
              >
                <Map
                  defaultCenter={{ lat: request.lat, lng: request.lng }}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  {/* User Marker */}
                  <AdvancedMarker position={{ lat: request.lat, lng: request.lng }}>
                    <div className="relative group">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                        <MapPin size={20} fill="currentColor" />
                      </div>
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-navy-900 px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-bold text-white whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        Your Location
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Worker Marker */}
                  {request.workerLocation && (
                    <AdvancedMarker position={request.workerLocation}>
                      <div className="relative group">
                        <div className={`w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white ${
                          request.type === 'Charging' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
                          {request.type === 'Charging' ? <Zap size={18} fill="currentColor" /> : <Wrench size={18} />}
                        </div>
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-navy-900 px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-bold text-white whitespace-nowrap border border-white/10">
                          {request.provider.name} (Live)
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}
                </Map>
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white shadow-lg pointer-events-auto">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 animate-pulse">
                         <Navigation size={16} />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Status</p>
                         <p className="text-xs font-bold text-navy-900">
                           {isSimulating ? 'Tracing live location...' : 'Waiting for provider signal...'}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="p-10 rounded-[32px]">
            <div className="flex items-center gap-6 mb-12">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 ${
                request.type === 'Charging' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {request.type === 'Charging' ? <Zap size={32} fill="currentColor" /> : <Wrench size={32} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">{request.type} Assistance</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-2 h-2 rounded-full ${request.status === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{request.status}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-2">
              {STATUS_SEQUENCE.map((status, idx) => {
                const isCompleted = STATUS_SEQUENCE.indexOf(request.status) >= idx;
                const isActive = request.status === status;
                const isLast = idx === STATUS_SEQUENCE.length - 1;
                
                return (
                  <div key={status} className="flex gap-6 relative">
                    {!isLast && (
                      <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${isCompleted && !isActive ? (request.type === 'Charging' ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-slate-100'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm transition-all duration-500 ${
                      isCompleted 
                        ? (request.type === 'Charging' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white') 
                        : 'bg-slate-100 text-slate-300'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isCompleted ? 'text-navy-900' : 'text-slate-400'}`}>{status}</p>
                      {isActive && (
                         <motion.p 
                           initial={{ opacity: 0, x: -5 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1"
                         >
                           Currently processing...
                         </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {request.status !== 'Completed' && (
              <div className="mt-12 pt-10 border-t border-slate-50">
                <button 
                  onClick={handleSimulateNextStatus}
                  className="w-full py-4 bg-navy-900 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-navy-900/10 hover:bg-navy-800 transition-all active:scale-95"
                >
                  Simulate Next Stage
                </button>
              </div>
            )}
          </Card>

          {request.status === 'Completed' && (
            <ReviewSection 
              request={request} 
              onSubmit={handleSubmitReview} 
              isSubmitting={submittingReview} 
            />
          )}

          <Card className="p-10 rounded-[32px]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Service Details</h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                   <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pickup Location</p>
                  <p className="text-sm font-bold text-navy-900 leading-relaxed">{request.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-sm font-bold text-navy-900">{request.vehicleType}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Problem</p>
                    <p className="text-sm font-bold text-navy-900">{request.problem}</p>
                  </div>
                </div>
              </div>
              {request.instructions && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Additional Instructions</p>
                  <p className="text-sm text-slate-600 font-medium italic">"{request.instructions}"</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Provider Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[32px]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Provider Info</h3>
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-slate-100 rounded-[28px] mx-auto mb-6 flex items-center justify-center text-slate-300 border-4 border-white shadow-xl shadow-slate-200/50">
                <UserIcon className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-bold text-navy-900">{request.provider.name}</h4>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Elite 10 Certified</p>
            </div>
            
            <div className="flex gap-4 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
                <Phone size={14} /> Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
                <MessageSquare size={14} /> Chat
              </button>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Service Fee</span>
                <span className="font-bold text-navy-900">{request.provider.fee}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Distance</span>
                <span className="font-bold text-navy-900">{request.provider.distance}</span>
              </div>
            </div>
          </Card>

          <div className="p-8 bg-navy-900 rounded-[32px] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-all duration-500" />
            <h4 className="text-lg font-bold mb-3 relative z-10">Need help?</h4>
            <p className="text-xs text-slate-400 font-medium mb-6 relative z-10 leading-relaxed">Our 24/7 support team is here for any roadside assistance emergencies.</p>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline relative z-10 transition-colors uppercase tracking-widest">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ request, onSubmit, isSubmitting }: { request: RescueRequest, onSubmit: (rating: number, review: string) => void, isSubmitting: boolean }) {
  const [rating, setRating] = useState(request.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(request.review || '');
  const isReviewed = !!request.rating;

  if (isReviewed) {
    return (
      <Card className="p-10 rounded-[32px] bg-white border border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Your Experience</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24} 
                className={star <= request.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} 
              />
            ))}
            <span className="ml-2 text-sm font-bold text-navy-900">{request.rating}/5</span>
          </div>
          {request.review && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600">
              "{request.review}"
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-10 rounded-[32px] border-2 border-emerald-100 bg-emerald-50/30">
      <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-8">Rate Your Experience</h3>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-bold text-navy-900 mb-4">How was the service with {request.provider.name}?</p>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  size={32} 
                  className={`transition-colors ${
                    star <= (hoveredRating || rating) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-slate-300'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Review (Optional)</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share details of your experience..."
            className="w-full p-6 bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm min-h-[120px] outline-none"
            maxLength={1000}
          />
        </div>

        <button
          disabled={rating === 0 || isSubmitting}
          onClick={() => onSubmit(rating, review)}
          className={`w-full py-4 rounded-[24px] font-bold text-sm transition-all shadow-lg ${
            rating > 0 && !isSubmitting
              ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-navy-900/20 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : 'Submit Review'}
        </button>
      </div>
    </Card>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

