import { useEffect } from 'react';
import useWebSocket from '../hooks/useWebsocket';


const setTableData = (data, setData, url, searchQuery, currentPage, itemsPerPage, setIsLoading) => {
  // 初回レンダリング時にdataをセット
  useEffect(() => {
      setData(data);
      setIsLoading(false);
  }, [data, setData]);

  // WebSocketを利用してリアルタイム更新
  useWebSocket(url, (updatedData) => {
      if (updatedData && updatedData.updated_data) {
          setData(updatedData.updated_data);
      } else {
          setData([]);
      }
      setIsLoading(false);
  }, searchQuery, currentPage, itemsPerPage);
}

export default setTableData