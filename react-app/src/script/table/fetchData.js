const fetchData = async (url, token, searchQuery = '', currentPage = 1, itemsPerPage = 10, model='') => {
  try {
      const response = await fetch(`${url}?searchQuery=${searchQuery}&currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`, {
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