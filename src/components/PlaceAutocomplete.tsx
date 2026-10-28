/// <reference types="google.maps" />
import React, { useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useAutocompleteSuggestions } from '@/src/hooks/useAutocompleteSuggestions';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface Props {
  onPlaceSelect: (coords: { lat: number; lng: number }, address: string) => void;
  value?: string;
  onInputChange?: (value: string) => void;
  className?: string;
}

export const PlaceAutocomplete: React.FC<Props> = ({ onPlaceSelect, value, onInputChange, className }) => {
  const places = useMapsLibrary('places');
  const [internalValue, setInternalValue] = useState('');
  
  const inputValue = value !== undefined ? value : internalValue;
  const setInputValue = (val: string) => {
    if (onInputChange) onInputChange(val);
    setInternalValue(val);
  };

  const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(inputValue);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestionClick = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!places || !suggestion.placePrediction) return;

      const place = suggestion.placePrediction.toPlace();

      try {
        await place.fetchFields({
          fields: ['location', 'formattedAddress', 'displayName']
        });

        if (place.location) {
          const coords = {
            lat: place.location.lat(),
            lng: place.location.lng()
          };
          const address = place.formattedAddress || place.displayName || '';
          
          setInputValue(address);
          setShowSuggestions(false);
          onPlaceSelect(coords, address);
          resetSession();
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    },
    [places, onPlaceSelect, resetSession]
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for a location..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-navy-900/10 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy-900 truncate">
                  {suggestion.placePrediction?.text.text}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate mt-0.5">
                  {suggestion.placePrediction?.mainText?.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && inputValue && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 text-center">
          <p className="text-sm font-bold text-slate-400">No locations found</p>
        </div>
      )}
    </div>
  );
};
