import { errorNoti, successNoti } from '../noti';

const exportExcel = async (url) => {
    try {
        // 1回のリクエストでJSONレスポンスを取得
        const response = await fetch(`${url}`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
            // base64データをBlobに変換してダウンロード
            const fileData = data.data.file_data;
            const filename = data.data.filename || "departments.xlsx";

            // base64をバイナリデータに変換
            const byteCharacters = atob(fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Blobを作成（正しいMIMEタイプを指定）
            const blob = new Blob([byteArray], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // ダウンロード処理
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

            successNoti('ダウンロードが完了しました');
        } else {
            errorNoti(data.message || 'Excelのダウンロードに失敗しました');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        errorNoti('ダウンロードに失敗しました');
    }
};

export default exportExcel;