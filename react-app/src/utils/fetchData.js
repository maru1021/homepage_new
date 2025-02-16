const fetchData = async (url, searchQuery = '', currentPage = 1, itemsPerPage = 10, model='') => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${url}?searchQuery=${searchQuery}&currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                tableDatas: data[model] || [],
                totalCount: data.totalCount || 0,
            };
        } else {
            return { tableDatas: [], totalCount: 0 };
        }
    } catch (error) {
        console.error('データ取得エラー:', error);
        return { tableDatas: [], totalCount: 0 };
    }
};

export default fetchData;