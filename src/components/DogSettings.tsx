import React, { useState } from 'react';
import { DogType, DogProfile } from '../types';
import { Dog, Settings, Info, Search, Check } from 'lucide-react';
import { DOG_BREEDS, getDogImage } from '../utils/dogData';

interface DogSettingsProps {
  profile: DogProfile;
  onUpdate: (profile: DogProfile) => void;
  onClose: () => void;
}

export const DogSettings: React.FC<DogSettingsProps> = ({ profile, onUpdate, onClose }) => {
  const [search, setSearch] = useState('');
  
  const filteredBreeds = DOG_BREEDS.filter(b => b.name.includes(search));

  const handleBreedSelect = (breed: typeof DOG_BREEDS[0]) => {
    onUpdate({
      ...profile,
      breed: breed.name,
      type: breed.type as DogType,
      imageUrl: getDogImage(breed.name)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-sky-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Dog className="w-6 h-6 text-sky-500" />
            </div>
            <h2 className="font-bold text-xl text-gray-800">愛犬の設定</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Profile Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-20 h-20 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center relative">
              {!profile.imageUrl ? (
                <div className="absolute inset-0 bg-sky-50 flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <img 
                  src={profile.imageUrl} 
                  alt={profile.breed}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-sky-500 uppercase tracking-wider">現在の設定</div>
              <div className="text-xl font-black text-gray-800">{profile.name}</div>
              <div className="text-sm text-gray-500 font-medium">{profile.breed}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
              お名前
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdate({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-medium"
              placeholder="愛犬の名前"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
              犬種を選択
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="犬種を検索"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
              {filteredBreeds.map((breed) => (
                <button
                  key={breed.name}
                  onClick={() => handleBreedSelect(breed)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    profile.breed === breed.name
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="font-bold text-gray-700">{breed.name}</span>
                  {profile.breed === breed.name && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 leading-relaxed">
              犬種に合わせて、暑さへの耐性（短鼻種など）を考慮した判定を行います。
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-sky-200 hover:bg-sky-600 active:scale-[0.98] transition-all"
          >
            設定を保存する
          </button>
        </div>
      </div>
    </div>
  );
};
