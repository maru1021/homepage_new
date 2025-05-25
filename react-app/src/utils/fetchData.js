import { errorNoti } from "./noti";

const fetchData = async (url, searchQuery = '', currentPage = 1, itemsPerPage = 10, model='') => {
    try {
        const response = await fetch(`${url}?searchQuery=${searchQuery}&currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`, {
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            if (data[model].success) {
                return {
                    tableDatas: data[model].data || [],
                    totalCount: data.totalCount || 0,
                };
            } else {
                errorNoti(data[model].message);
                return { tableDatas: [], totalCount: 0 };
            }
        } else {
            // 認証エラー (401) の場合はログインページにリダイレクト
            if (response.status === 401) {
                window.location.href = '/login';
                return { tableDatas: [], totalCount: 0 };
            }

            // 権限エラー (403) の場合は404ページにリダイレクト
            if (response.status === 403) {
                const errorData = await response.json();
                window.location.href = errorData.detail.redirect || '/error/404';
                return { tableDatas: [], totalCount: 0 };
            }

            throw new Error(`APIリクエストエラー: ${response.status}`);
        }
    } catch (error) {
        console.error('データ取得エラー:', error.message);
        return { tableDatas: [], totalCount: 0 };
    }
};

export default fetchData;