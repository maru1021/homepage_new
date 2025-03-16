/**
 * 認証サービス - トークン管理とユーザー認証を処理
 */
import { API_BASE_URL } from '../config/baseURL';

class AuthService {
  // ログインを処理し、トークンを保存
  async login(username, password) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // CORSリクエストのための追加ヘッダー
          'Accept': 'application/json'
        },
        body: formData,
        credentials: 'include', // クッキーを含める
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '社員番号もしくはパスワードが間違えています');
      }

      const data = await response.json();

      // ローカルストレージに最低限の情報のみを保存
      this.saveUserInfo(data);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // ユーザー情報を保存（機密情報は含めない）
  saveUserInfo(data) {
    const userInfo = {
      userId: data.user_id,
      employeeNo: data.employee_no,
      name: data.name,
      expiration_time: data.expiration_time
    };

    localStorage.setItem('currentUser', JSON.stringify(userInfo));
  }

  // 現在のユーザー情報を取得
  getCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) return null;

    try {
      return JSON.parse(userString);
    } catch (e) {
      console.error('Invalid user data in localStorage', e);
      return null;
    }
  }

  // ログアウト
  async logout() {
    try {
      // サーバーサイドのログアウト処理を呼び出し
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // クッキーを含める
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ローカルストレージからユーザー情報を削除
      localStorage.removeItem('currentUser');
    }
  }

  // トークンのリフレッシュ
  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // クッキーを含める
      });

      if (!response.ok) {
        throw new Error('トークンのリフレッシュに失敗しました');
      }

      const data = await response.json();

      // 有効期限を更新
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        currentUser.expiration_time = data.expiration_time;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // リフレッシュに失敗したらユーザー情報をクリア
      localStorage.removeItem('currentUser');
      throw error;
    }
  }

  // ユーザーが認証されているかチェック
  isAuthenticated() {
    const userInfo = this.getCurrentUser();
    if (!userInfo) return false;

    // 有効期限をチェック
    const expiration = new Date(userInfo.expiration_time);
    const now = new Date();

    return now < expiration;
  }

  // ユーザーIDを取得
  getUserId() {
    const userInfo = this.getCurrentUser();
    return userInfo ? userInfo.userId : null;
  }
}

export default new AuthService();