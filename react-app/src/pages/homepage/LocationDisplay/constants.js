// 都市とその英語表記のマッピング
export const CITY_MAPPING = {
  "東京": "Tokyo",
  "大阪": "Osaka",
  "福岡": "Fukuoka",
  "札幌": "Sapporo",
  "名古屋": "Nagoya",
  "広島": "Hiroshima",
  "仙台": "Sendai",
  "那覇": "Naha"
};

// セレクトボックスに表示する都市リスト
export const CITIES = Object.keys(CITY_MAPPING);

// デフォルト値の設定
export const DEFAULT_CITY = '東京';
export const DEFAULT_COUNTRY = '日本';
export const DEFAULT_CITY_EN = 'Tokyo';