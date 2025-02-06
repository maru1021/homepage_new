import { useEffect, useRef } from "react";


const useWebSocket = (url, updateFunc) => {
    const wsRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        console.log("WebSocket 接続を開始");
        wsRef.current = new WebSocket(`${url}?token=${token}`);

        wsRef.current.onopen = () => console.log("WebSocket 接続成功");
        wsRef.current.onmessage = (event) => {
            try {
                const updatedData = JSON.parse(event.data);
                updateFunc(updatedData);
            } catch (error) {
                console.error("WebSocketメッセージのパースに失敗:", error);
            }
        };

        wsRef.current.onerror = (error) => console.error("WebSocketエラー:", error);
        wsRef.current.onclose = () => {
            console.log("WebSocket接続を閉じる");
            wsRef.current = null;
        };

        return () => {
            if (wsRef.current) {
                console.log("WebSocketをクリーンアップ");
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);  //依存配列を[]にすることで、マウント時のみWebSocket接続

    return wsRef.current;
};

export default useWebSocket;
