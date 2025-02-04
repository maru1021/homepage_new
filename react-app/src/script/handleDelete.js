import { successNoti, errorNoti } from './noti';

const handleDelete = async (url, onSave, closeDeleteModal) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
      url,
      {
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          method: 'DELETE'
      }
  );
  const data = await response.json();

  if (response.ok && data.success) {
      successNoti('削除成功に成功しました');
      onSave();
  } else {
      errorNoti(data.message ?? '削除に失敗しました。');
  }
  closeDeleteModal();
};

export default handleDelete;