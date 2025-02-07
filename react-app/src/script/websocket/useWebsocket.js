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
        wsRef.current = new WebSocket(`${url}?token=${token}`);

        wsRef.current.onopen = () => {
            console.log("WebSocket 接続成功");

            // 初回接続時にデータ送信
            const message = {
                action: "subscribe",
                searchQuery: searchQueryRef.current,
                currentPage: currentPageRef.current,
                itemsPerPage: itemsPerPageRef.current,
            };

            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(message));
            } else {
                console.error("WebSocketがまだ開いていません");
            }
        };

        // WebSocketからメッセージを受信
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
            console.log("WebSocket 接続を閉じる");
            wsRef.current = null;
        };

        return () => {
            if (wsRef.current) {
                console.log("WebSocketをクリーンアップ");
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url]);  // 初回の WebSocket接続のみ実行

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
    }, [searchQuery, currentPage, itemsPerPage]);  // WebSocketを閉じずにメッセージのみ送信

    return wsRef.current;
};

export default useWebSocket;
