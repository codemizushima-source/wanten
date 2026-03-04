import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Settings, 
  Thermometer, 
  Droplets, 
  Sun, 
  Footprints, 
  Bell, 
  ChevronRight,
  Clock,
  Calendar,
  AlertTriangle,
  Cloud,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocationPicker } from './components/LocationPicker';
import { DogSettings } from './components/DogSettings';
import { TimelineChart } from './components/TimelineChart';
import { calculateComfortLevel, estimateRoadTemp } from './utils/weatherUtils';
import { DEFAULT_LOCATION } from './utils/locationData';
import { getDogImage } from './utils/dogData';
import { generateDogIllustration } from './services/geminiService';
import { DogProfile, Location, WeatherData, ComfortLevel, DailyForecast } from './types';
import { format, addHours, startOfHour, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function App() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [profile, setProfile] = useState<DogProfile>({
    name: 'ポチ',
    breed: '柴犬',
    type: 'standard',
    size: 'medium',
    imageUrl: '' // Initially empty to trigger generation
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDogSettings, setShowDogSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState<'today' | 'forecast'>('today');

  // Generate AI image when breed changes
  useEffect(() => {
    const updateImage = async () => {
      if (!profile.imageUrl) {
        setIsGeneratingImage(true);
        const url = await generateDogIllustration(profile.breed);
        if (url) {
          setProfile(prev => ({ ...prev, imageUrl: url }));
        } else {
          // Fallback if generation fails
          setProfile(prev => ({ ...prev, imageUrl: getDogImage(profile.breed) }));
        }
        setIsGeneratingImage(false);
      }
    };
    updateImage();
  }, [profile.breed, profile.imageUrl]);

  const handleProfileUpdate = (newProfile: DogProfile) => {
    // If breed changed, clear imageUrl to trigger re-generation
    if (newProfile.breed !== profile.breed) {
      setProfile({ ...newProfile, imageUrl: '' });
    } else {
      setProfile(newProfile);
    }
  };

  // Mock current weather - Adjusting for March 3rd realism
  const currentWeather: WeatherData = useMemo(() => ({
    temp: 12, // March in Japan is cooler
    humidity: 45,
    clouds: 10,
    timestamp: Date.now(),
    condition: '快晴'
  }), []);

  const comfort = useMemo(() => calculateComfortLevel(currentWeather, profile), [currentWeather, profile]);
  const roadTemp = useMemo(() => estimateRoadTemp(currentWeather.temp, currentWeather.clouds, currentWeather.timestamp), [currentWeather]);

  // Mock 24h forecast
  const forecastData = useMemo(() => {
    const data = [];
    const start = startOfHour(new Date());
    for (let i = 0; i < 24; i++) {
      const time = addHours(start, i);
      const hour = time.getHours();
      // March temp curve: 5 to 15 degrees
      const baseTemp = 10 + Math.sin((hour - 8) * Math.PI / 12) * 5;
      const clouds = hour > 18 || hour < 6 ? 100 : 10;
      const weather: WeatherData = {
        temp: Math.round(baseTemp),
        humidity: 50,
        clouds,
        timestamp: time.getTime(),
        condition: '晴れ'
      };
      const c = calculateComfortLevel(weather, profile);
      data.push({
        time: format(time, 'H:00'),
        temp: Math.round(baseTemp),
        level: c.level,
        comfort: c
      });
    }
    return data;
  }, [profile]);

  // Mock 3-day forecast
  const dailyForecasts: DailyForecast[] = useMemo(() => {
    const data = [];
    for (let i = 0; i < 3; i++) {
      const date = addDays(new Date(), i);
      const maxTemp = 14 + i;
      const minTemp = 4 + i;
      const weather: WeatherData = {
        temp: maxTemp,
        humidity: 50,
        clouds: 20,
        timestamp: date.getTime(),
        condition: '晴れ'
      };
      data.push({
        date: format(date, 'M/d (E)', { locale: ja }),
        avgTemp: Math.round((maxTemp + minTemp) / 2),
        maxTemp,
        minTemp,
        condition: '晴れ',
        comfort: calculateComfortLevel(weather, profile)
      });
    }
    return data;
  }, [profile]);

  const bestTime = useMemo(() => {
    const best = [...forecastData].sort((a, b) => a.level - b.level)[0];
    return best;
  }, [forecastData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-sky-100">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setShowLocationPicker(true)}
        >
          <div className="p-2 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors">
            <MapPin className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">現在地</div>
            <div className="font-bold text-gray-800 flex items-center gap-1 text-sm sm:text-base">
              {location.name}
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowDogSettings(true)}
          className="p-2 sm:p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Settings className="w-6 h-6 text-gray-400" />
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-sky-100">
          <button 
            onClick={() => setView('today')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'today' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            今日
          </button>
          <button 
            onClick={() => setView('forecast')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'forecast' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            3日間予報
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'today' ? (
            <motion.div 
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Current Comfort Card */}
              <motion.div 
                className={`relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl ${comfort.color}`}
              >
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-20">
                  <span className="text-8xl sm:text-9xl select-none">{comfort.icon}</span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Lv.{comfort.level} {comfort.status}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
                    {comfort.status}
                  </h1>
                  <p className="text-base sm:text-lg font-medium leading-relaxed opacity-90 max-w-[85%]">
                    {comfort.advice}
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-3xl">
                      <Thermometer className="w-5 h-5 mb-2" />
                      <div className="text-[10px] opacity-70 font-bold">気温</div>
                      <div className="text-lg sm:text-xl font-black">{currentWeather.temp}°C</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-3xl">
                      <Droplets className="w-5 h-5 mb-2" />
                      <div className="text-[10px] opacity-70 font-bold">湿度</div>
                      <div className="text-lg sm:text-xl font-black">{currentWeather.humidity}%</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-3xl">
                      <Footprints className="w-5 h-5 mb-2" />
                      <div className="text-[10px] opacity-70 font-bold">路面温度</div>
                      <div className="text-lg sm:text-xl font-black">{roadTemp}°C</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Alerts / Recommendations */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-sky-100 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">今日のベストタイム</div>
                    <div className="text-base sm:text-lg font-bold text-gray-800">
                      {bestTime.time}頃が最も快適です
                    </div>
                  </div>
                </div>

                {roadTemp >= 35 && (
                  <div className="bg-amber-50 p-5 sm:p-6 rounded-[2rem] border border-amber-100 flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">注意アラート</div>
                      <div className="text-base sm:text-lg font-bold text-amber-800 leading-tight">
                        アスファルトが高温です。肉球の火傷に注意！
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <section className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-sky-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
                    お散歩タイムライン
                  </h2>
                  <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    24時間予報
                  </div>
                </div>
                
                <TimelineChart data={forecastData} />
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="forecast"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {dailyForecasts.map((day, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${day.comfort.color} text-white shadow-lg`}>
                      {day.comfort.icon}
                    </div>
                    <div>
                      <div className="font-black text-gray-800">{day.date}</div>
                      <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <Cloud className="w-4 h-4" /> {day.condition}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-800">{day.maxTemp}° / {day.minTemp}°</div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${day.comfort.color} text-white mt-1`}>
                      {day.comfort.status}
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-sky-100/50 p-6 rounded-[2rem] border border-sky-100 text-center">
                <p className="text-sm text-sky-700 font-medium">
                  3日先までの予報を表示しています。<br/>
                  お散歩の計画にお役立てください。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dog Profile Quick Info */}
        <section className="bg-sky-600 p-6 sm:p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 flex items-center justify-center relative">
                {isGeneratingImage ? (
                  <div className="absolute inset-0 bg-sky-100 flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <img 
                    src={profile.imageUrl || getDogImage(profile.breed)} 
                    alt={profile.breed}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black">{profile.name}</h3>
                <p className="text-sky-100 font-medium text-sm">
                  {profile.breed}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowDogSettings(true)}
              className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl font-bold text-xs sm:text-sm hover:bg-white/30 transition-all"
            >
              設定
            </button>
          </div>
          <p className="text-sky-100 text-xs sm:text-sm leading-relaxed relative z-10">
            {profile.name}ちゃんの犬種（{profile.breed}）に合わせた判定を行っています。
            {profile.type === 'brachycephalic' && '短鼻種は暑さに非常に弱いため、早めの対策をおすすめします。'}
          </p>
        </section>

        {/* Affiliate / Recommended Goods Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-pink-500" />
              おすすめお散歩グッズ
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="#" 
              target="_blank" 
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🧊
              </div>
              <div className="text-xs font-bold text-pink-500 mb-1 uppercase">暑さ対策</div>
              <div className="text-sm font-bold text-gray-800 leading-tight mb-2">冷感クールベスト</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Amazonで見る</span>
                <ExternalLink className="w-3 h-3 text-gray-300" />
              </div>
            </a>
            
            <a 
              href="#" 
              target="_blank" 
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🧴
              </div>
              <div className="text-xs font-bold text-pink-500 mb-1 uppercase">肉球保護</div>
              <div className="text-sm font-bold text-gray-800 leading-tight mb-2">保護用パウワックス</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">楽天で見る</span>
                <ExternalLink className="w-3 h-3 text-gray-300" />
              </div>
            </a>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
            <p className="text-[10px] text-pink-400 font-bold text-center leading-relaxed">
              ※上記リンクはアフィリエイト広告を含みます。収益はアプリの運営に役立てられます。
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation (Floating) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-2 flex items-center justify-around z-40">
        <button 
          onClick={() => setView('today')}
          className={`flex flex-col items-center gap-1 p-3 transition-colors ${view === 'today' ? 'text-sky-500' : 'text-gray-400'}`}
        >
          <Sun className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">今日</span>
        </button>
        <button 
          onClick={() => setView('forecast')}
          className={`flex flex-col items-center gap-1 p-3 transition-colors ${view === 'forecast' ? 'text-sky-500' : 'text-gray-400'}`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">予報</span>
        </button>
        <button 
          onClick={() => setShowLocationPicker(true)}
          className="flex flex-col items-center gap-1 p-3 text-gray-400 hover:text-sky-400 transition-colors"
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">地域</span>
        </button>
        <button 
          onClick={() => setShowDogSettings(true)}
          className="flex flex-col items-center gap-1 p-3 text-gray-400 hover:text-sky-400 transition-colors"
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">設定</span>
        </button>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LocationPicker 
              onSelect={(loc) => {
                setLocation(loc);
                setShowLocationPicker(false);
              }}
              onClose={() => setShowLocationPicker(false)}
            />
          </motion.div>
        )}
        {showDogSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DogSettings 
              profile={profile}
              onUpdate={handleProfileUpdate}
              onClose={() => setShowDogSettings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
