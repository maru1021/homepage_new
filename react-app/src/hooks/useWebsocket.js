import { useEffect, useRef } from "react";

const useWebSocket = (url, updateFunc, searchQuery, currentPage, itemsPerPage) => {
    const wsRef = useRef(null);
    const searchQueryRef = useRef(searchQuery);
    const currentPageRef = useRef(currentPage);
    const itemsPerPageRef = useRef(itemsPerPage);

    // WebSocket接続（初回のみ実行）
    useEffect(() => {
        // ページ移動時に前のページでのWebSocketを閉じる
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        const token = localStorage.getItem("token");
        wsRef.current = new WebSocket(`${url}?searchQuery=${searchQuery}&currentPage=${currentPage}&itemsPerPage=${itemsPerPage}&token=${token}`);

        wsRef.current.onopen = () => {
            // 初回接続時にサーバーにデータ送信
            const message = {
                action: "subscribe",
                searchQuery: searchQueryRef.current,
                currentPage: currentPageRef.current,
                itemsPerPage: itemsPerPageRef.current,
            };

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(message));
            }
        };

        // WebSocketでデータが送られてきた時の処理
        wsRef.current.onmessage = (event) => {
            try {
                if(wsRef.current != null){
                    const updatedData = JSON.parse(event.data);
                    updateFunc(updatedData);
                }
            } catch (error) {
                console.error("WebSocketメッセージのパースに失敗:", error);
            }
        };

        wsRef.current.onerror = (error) => console.error("WebSocketエラー:", error);
        wsRef.current.onclose = () => {
            wsRef.current = null;
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url]);  // 初回のWebSocket接続のみ実行

    // 検索などの変更を監視して最新の値を反映
    useEffect(() => {
        searchQueryRef.current = searchQuery;
        currentPageRef.current = currentPage;
        itemsPerPageRef.current = itemsPerPage;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message = {
                action: "subscribe",
                searchQuery,
                currentPage,
                itemsPerPage
            };
            wsRef.current.send(JSON.stringify(message));
        }
    }, [searchQuery, currentPage, itemsPerPage]);

    return wsRef.current;
};

export default useWebSocket;
