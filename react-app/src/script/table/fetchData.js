const fetchData = async (url, token, query = '', page = 1, limit = 10, model='') => {
  try {
      const response = await fetch(`${url}?search=${query}&page=${page}&limit=${limit}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      if (response.ok) {
          const data = await response.json();
          console.log(data)
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