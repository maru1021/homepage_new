import { successNoti, errorNoti } from '../noti';


const importExcel = async (url, token) => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        input.style.display = 'none';

        input.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject(new Error('ファイルが選択されませんでした'));
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    successNoti(data.message || 'Excelのアップロードに成功しました');
                    // fetchData();
                    resolve(data);
                } else {
                    errorNoti(data.message || 'Excelのアップロードに失敗しました');
                }
            } catch (error) {
                console.error('Excelアップロードエラー:', error);
                errorNoti(error.message);
                reject(error);
            }
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    });
};

export default importExcel;