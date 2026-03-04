import { DogProfile, WeatherData, ComfortLevel } from '../types';

/**
 * 路面温度の推計
 * T_road = T_air + (SolarRadiationIndex * Correction)
 * 季節や時間帯を考慮した補正
 */
export const estimateRoadTemp = (temp: number, clouds: number, timestamp: number): number => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const month = date.getMonth();

  // 日射強度の推定 (10:00 - 16:00 がピーク)
  let solarIntensity = 0;
  if (hour >= 6 && hour <= 18) {
    solarIntensity = Math.sin((hour - 6) * Math.PI / 12);
  }

  // 雲による遮蔽
  const cloudFactor = (100 - clouds) / 100;
  
  // 季節による補正 (夏は高く、冬は低い)
  const seasonalFactor = 0.5 + Math.sin((month - 3) * Math.PI / 6) * 0.5;

  // 基本的な上昇幅 (最大25度程度)
  const tempRise = 25 * solarIntensity * cloudFactor * (0.7 + 0.3 * seasonalFactor);
  
  return Math.round(temp + tempRise);
};

export const calculateComfortLevel = (
  weather: WeatherData,
  profile: DogProfile
): ComfortLevel => {
  const roadTemp = estimateRoadTemp(weather.temp, weather.clouds, weather.timestamp);
  const { temp, humidity } = weather;

  // 不快指数 (DI) 簡易計算
  const di = 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3;

  // 犬種による補正
  let thresholdAdjustment = 0;
  if (profile.type === 'brachycephalic') thresholdAdjustment -= 3; // 短鼻種は暑さに弱い
  if (profile.type === 'cold_climate') thresholdAdjustment -= 2; // 寒冷地種も暑さに弱い
  if (profile.type === 'puppy_senior') thresholdAdjustment -= 1; // 子犬・シニアも注意

  const adjustedTemp = temp + thresholdAdjustment;

  if (roadTemp >= 50 || adjustedTemp >= 35) {
    return {
      level: 6,
      status: '外出禁止',
      advice: '肉球の火傷や熱中症の危険大。室内遊びを。',
      color: 'bg-purple-600',
      icon: '🚫'
    };
  } else if (roadTemp >= 40 || adjustedTemp >= 31) {
    return {
      level: 5,
      status: '厳重警戒',
      advice: '日中の散歩は避けて。早朝か深夜に。',
      color: 'bg-red-500',
      icon: '😫'
    };
  } else if (roadTemp >= 35 || adjustedTemp >= 28 || di >= 80) {
    return {
      level: 4,
      status: '警戒',
      advice: '短時間の散歩に留めるか、草地を選んで。',
      color: 'bg-orange-400',
      icon: '🥵'
    };
  } else if (roadTemp >= 30 || adjustedTemp >= 25 || di >= 75) {
    return {
      level: 3,
      status: '注意',
      advice: '日陰を選んで歩きましょう。',
      color: 'bg-yellow-400',
      icon: '😟'
    };
  } else if (adjustedTemp >= 15) {
    return {
      level: 2,
      status: '快適',
      advice: '楽しく歩けます。水分補給は忘れずに。',
      color: 'bg-emerald-400',
      icon: '😊'
    };
  } else {
    return {
      level: 1,
      status: '最高！',
      advice: 'お散歩日和です。ドッグランもおすすめ！',
      color: 'bg-sky-400',
      icon: '🐶'
    };
  }
};
