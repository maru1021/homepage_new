// src/services/apiClient.js

import AuthService from './auth';
import { API_BASE_URL } from '../config/baseURL';

/**
 * セキュアなAPIリクエストのためのユーティリティクラス
 * 認証トークンの自動リフレッシュやエラーハンドリングを行います
 */
class ApiClient {
  /**
   * APIリクエストを送信
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} options - fetch APIのオプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async request(endpoint, options = {}) {
    // デフォルトオプションの設定
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // HTTPOnlyクッキーを含める
    };

    // オプションをマージ
    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      // リクエスト実行
      let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

      // 認証エラー（401）の場合、トークンのリフレッシュを試みる
      if (response.status === 401 && AuthService.getCurrentUser()) {
        try {
          // トークンをリフレッシュ
          await AuthService.refreshToken();

          // リフレッシュ後に再リクエスト
          response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // リフレッシュに失敗した場合はログイン画面へリダイレクト
          window.location.href = '/login';
          throw new Error('認証期限切れ。再ログインが必要です。');
        }
      }

      // 応答がOKでない場合のエラーハンドリング
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! Status: ${response.status}`);
      }

      // レスポンスをJSONとして解析して返す
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} options - 追加オプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} data - 送信するデータ
   * @param {Object} options - 追加オプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} data - 送信するデータ
   * @param {Object} options - 追加オプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} options - 追加オプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * ファイルアップロード用POSTリクエスト
   * Content-Typeヘッダーを設定しない（ブラウザが自動設定）
   * @param {string} endpoint - APIエンドポイント
   * @param {FormData} formData - フォームデータ
   * @param {Object} options - 追加オプション
   * @returns {Promise<Object>} レスポンスデータ
   */
  async uploadFile(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Content-Typeを自動設定させる
      ...options,
    });
  }

  /**
   * 現在のユーザーID取得
   * @returns {number|null} ユーザーID
   */
  getCurrentUserId() {
    return AuthService.getUserId();
  }
}

// シングルトンインスタンスをエクスポート
export default new ApiClient();