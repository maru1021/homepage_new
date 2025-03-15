import { CITY_MAPPING, DEFAULT_CITY, DEFAULT_COUNTRY, DEFAULT_CITY_EN } from './constants';

/**
 * IP位置情報を取得する関数
 * @param {string} apiBaseUrl - APIのベースURL
 * @returns {Promise<Object>} - 位置情報オブジェクト
 */
export const fetchLocationInfo = async (apiBaseUrl) => {
  try {
    const response = await fetch(`${apiBaseUrl}/public/current_location/location`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'ロケーション情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('位置情報の取得中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * 天気情報を取得する関数
 * @param {string} apiBaseUrl - APIのベースURL
 * @param {string} city - 都市名（日本語）
 * @param {string} country - 国名
 * @returns {Promise<Object>} - 天気情報オブジェクト
 */
export const fetchWeatherData = async (apiBaseUrl, city, country) => {
  try {
    // 都市が指定されていない場合はデフォルト値を使用
    const targetCity = city || DEFAULT_CITY;
    const targetCountry = country || DEFAULT_COUNTRY;

    // 日本語の都市名を英語に変換
    const cityInEnglish = CITY_MAPPING[targetCity] || DEFAULT_CITY_EN;

    // 英語の都市名でAPIリクエスト
    const response = await fetch(
      `${apiBaseUrl}/public/current_location/weather?city=${encodeURIComponent(cityInEnglish)}&country=${encodeURIComponent(targetCountry)}`
    );

    if (!response.ok) {
      console.error('天気情報の取得に失敗しました');
      // エラー時はダミーデータを返す
      return {
        temperature: '-',
        condition: '-',
        humidity: '-',
        windSpeed: '-',
        icon: '01d'
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('天気情報の取得中にエラーが発生しました:', error);
    // エラー時はダミーデータを返す
    return {
      temperature: '-',
      condition: '-',
      humidity: '-',
      windSpeed: '-',
      icon: '01d'
    };
  }
};

/**
 * ブラウザの位置情報をサーバーに送信して地名情報を取得する
 * @param {string} apiBaseUrl - APIのベースURL
 * @param {number} latitude - 緯度
 * @param {number} longitude - 経度
 * @returns {Promise<Object>} - 地名情報を含む位置情報オブジェクト
 */
export const sendGeolocationToServer = async (apiBaseUrl, latitude, longitude) => {
  try {
    const response = await fetch(`${apiBaseUrl}/public/current_location/browser-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      throw new Error('位置情報の処理に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('位置情報の送信中にエラーが発生しました:', error);
    throw error;
  }
};