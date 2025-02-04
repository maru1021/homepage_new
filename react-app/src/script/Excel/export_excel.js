import { errorNoti } from '../../script/noti';

const exportExcel = async (url, token) => {
    const response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'departments.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        errorNoti('Excelのダウンロードに失敗しました');
    }
};

export default exportExcel;