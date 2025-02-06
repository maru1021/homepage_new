import { useEffect } from 'react';
import useWebSocket from '../websocket/useWebsocket';

const setTableData = (data, setData, url) => {
  // 初回レンダリング時にdataをセット
  useEffect(() => {
      if (data.length > 0) {
          setData(data);
      }
  }, [data, setData]);

  // WebSocketを利用してリアルタイム更新
  useWebSocket(url, (updatedData) => {
      setData(updatedData.updated_data);
  });
}

export default setTableData