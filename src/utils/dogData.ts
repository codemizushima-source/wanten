export const DOG_BREEDS = [
  { name: '柴犬', type: 'standard', size: 'medium' },
  { name: 'トイ・プードル', type: 'standard', size: 'small' },
  { name: 'チワワ', type: 'standard', size: 'small' },
  { name: 'ミニチュア・ダックスフンド', type: 'standard', size: 'small' },
  { name: 'ポメラニアン', type: 'standard', size: 'small' },
  { name: 'ミニチュア・シュナウザー', type: 'standard', size: 'small' },
  { name: 'ヨークシャー・テリア', type: 'standard', size: 'small' },
  { name: 'フレンチ・ブルドッグ', type: 'brachycephalic', size: 'medium' },
  { name: 'パグ', type: 'brachycephalic', size: 'small' },
  { name: 'シー・ズー', type: 'brachycephalic', size: 'small' },
  { name: 'ゴールデン・レトリバー', type: 'standard', size: 'large' },
  { name: 'ラブラドール・レトリバー', type: 'standard', size: 'large' },
  { name: 'シベリアン・ハスキー', type: 'cold_climate', size: 'large' },
  { name: '秋田犬', type: 'cold_climate', size: 'large' },
  { name: 'ボーダー・コリー', type: 'standard', size: 'medium' },
  { name: 'コーギー', type: 'standard', size: 'medium' },
  { name: 'パピヨン', type: 'standard', size: 'small' },
  { name: 'ジャック・ラッセル・テリア', type: 'standard', size: 'small' },
  { name: 'キャバリア', type: 'standard', size: 'small' },
  { name: 'マルチーズ', type: 'standard', size: 'small' },
];

export const getDogImage = (breed: string): string => {
  // Mapping Japanese breed names to English keywords for better search results in free stock photo APIs
  const breedMap: Record<string, string> = {
    '柴犬': 'shiba,inu',
    'トイ・プードル': 'poodle',
    'チワワ': 'chihuahua',
    'ミニチュア・ダックスフンド': 'dachshund',
    'ポメラニアン': 'pomeranian',
    'ミニチュア・シュナウザー': 'schnauzer',
    'ヨークシャー・テリア': 'yorkie',
    'フレンチ・ブルドッグ': 'french,bulldog',
    'パグ': 'pug',
    'シー・ズー': 'shih,tzu',
    'ゴールデン・レトリバー': 'golden,retriever',
    'ラブラドール・レトリバー': 'labrador',
    'シベリアン・ハスキー': 'husky',
    '秋田犬': 'akita',
    'ボーダー・コリー': 'border,collie',
    'コーギー': 'corgi',
    'パピヨン': 'papillon',
    'ジャック・ラッセル・テリア': 'jack,russell',
    'キャバリア': 'cavalier',
    'マルチーズ': 'maltese',
  };

  const keyword = breedMap[breed] || 'dog';
  // Using LoremFlickr which is a reliable wrapper for Creative Commons images (Unsplash/Flickr)
  // Adding a random seed to avoid caching issues when switching breeds
  return `https://loremflickr.com/800/600/dog,${keyword}?lock=${encodeURIComponent(breed)}`;
};
