import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, ChevronRight } from 'lucide-react';
import { PREFECTURES, MOCK_CITIES } from '../utils/locationData';
import { Location } from '../types';

interface LocationPickerProps {
  onSelect: (location: Location) => void;
  onClose: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose }) => {
  const [step, setStep] = useState<'prefecture' | 'city'>('prefecture');
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrefectures = PREFECTURES.filter(p => p.includes(searchQuery));
  
  const cities = selectedPref ? (MOCK_CITIES[selectedPref] || ['主要都市1', '主要都市2', '主要都市3']) : [];
  const filteredCities = cities.filter(c => c.includes(searchQuery));

  const handlePrefSelect = (pref: string) => {
    setSelectedPref(pref);
    setStep('city');
    setSearchQuery('');
  };

  const handleCitySelect = (city: string) => {
    onSelect({
      id: `${selectedPref}-${city}`,
      name: city,
      prefecture: selectedPref!,
      lat: 35.6895, // Mock coords
      lon: 139.6917
    });
  };

  const handleBack = () => {
    if (step === 'city') {
      setStep('prefecture');
      setSelectedPref(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden">
        <div className="p-4 border-bottom border-gray-100 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {step === 'city' ? <ChevronRight className="rotate-180" /> : <X />}
          </button>
          <h2 className="font-bold text-lg">
            {step === 'prefecture' ? '都道府県を選択' : `${selectedPref}の市区町村`}
          </h2>
          <div className="w-10" />
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="地域名で検索"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {step === 'prefecture' ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredPrefectures.map(pref => (
                <button
                  key={pref}
                  onClick={() => handlePrefSelect(pref)}
                  className="p-4 text-left hover:bg-sky-50 rounded-2xl transition-colors flex items-center justify-between group"
                >
                  <span className="font-medium text-gray-700">{pref}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="w-full p-4 text-left hover:bg-sky-50 rounded-2xl transition-colors flex items-center justify-between group"
                >
                  <span className="font-medium text-gray-700">{city}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            className="w-full py-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              // In a real app, use navigator.geolocation
              handleCitySelect('現在地');
            }}
          >
            <MapPin className="w-5 h-5 text-sky-500" />
            現在地を取得
          </button>
        </div>
      </div>
    </div>
  );
};
