import { useEffect, useRef } from "react";
import API_BASE_URL from "../baseURL";

const useWebSocket = (onMessage) => {
    const wsRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("⚠️ トークンが見つかりません。ログインしていますか？");
            return;
        }

        if (wsRef.current) {
            console.log("⚠️ 既存の WebSocket 接続があるため、新しい接続は作りません。");
            return;
        }

        console.log("✅ WebSocket 接続を開始");
        wsRef.current = new WebSocket(`${API_BASE_URL.replace("http", "ws")}/ws/departments?token=${token}`);

        wsRef.current.onopen = () => console.log("✅ WebSocket 接続成功");
        wsRef.current.onmessage = (event) => {
            try {
                const updatedData = JSON.parse(event.data);
                onMessage(updatedData);
            } catch (error) {
                console.error("⚠️ WebSocket メッセージのパースに失敗:", error);
            }
        };

        wsRef.current.onerror = (error) => console.error("❌ WebSocketエラー:", error);
        wsRef.current.onclose = () => {
            console.log("🔌 WebSocket 接続を閉じる");
            wsRef.current = null;
        };

        return () => {
            if (wsRef.current) {
                console.log("🛑 WebSocket をクリーンアップ");
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);  // 🔥 依存配列を `[]` にすることで、マウント時のみ WebSocket 接続

    return wsRef.current;
};

export default useWebSocket;
