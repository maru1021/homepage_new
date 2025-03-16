const fetchData = async (url, searchQuery = '', currentPage = 1, itemsPerPage = 10, model='') => {
    try {
        const response = await fetch(`${url}?searchQuery=${searchQuery}&currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`, {
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return {
                tableDatas: data[model] || [],
                totalCount: data.totalCount || 0,
            };
        } else {
            // 認証エラー (401) の場合はログインページにリダイレクト
            if (response.status === 401) {
                window.location.href = '/login';
            }
            return { tableDatas: [], totalCount: 0 };
        }
    } catch (error) {
        console.error('データ取得エラー:', error);
        return { tableDatas: [], totalCount: 0 };
    }
};

export default fetchData;