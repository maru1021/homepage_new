import { useEffect } from 'react';
import useWebSocket from '../hooks/useWebsocket';


const setTableData = (data, setData, url, searchQuery, currentPage, itemsPerPage) => {
  // 初回レンダリング時にdataをセット
  useEffect(() => {
      if (data.length > 0) {
          setData(data);
      }
  }, [data, setData]);

  // WebSocketを利用してリアルタイム更新
  useWebSocket(url, (updatedData) => {
      setData(updatedData.updated_data);
  }, searchQuery, currentPage, itemsPerPage);
}

export default setTableData