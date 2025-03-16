import { errorNoti } from '../noti';


const exportExcel = async (url) => {
    const response = await fetch(`${url}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get("Content-Disposition");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        let fileName = "download.xlsx"; // デフォルトのファイル名

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match) {
                fileName = match[1]; // ファイル名を取得
            }
        }

        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        errorNoti('Excelのダウンロードに失敗しました');
    }
};

export default exportExcel;