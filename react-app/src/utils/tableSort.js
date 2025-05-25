import { successNoti, errorNoti } from "./noti";


// 行の並び替え処理
const tableSort = async (url, data, dragIndex, hoverIndex) => {
  const draggedRow = data[dragIndex];
  const newTypes = [...data];
  newTypes.splice(dragIndex, 1);
  newTypes.splice(hoverIndex, 0, draggedRow);
  const updatedTypes = newTypes.map((data, index) => ({
      ...data,
      sort: index + 1
  }));

  try {
      // 並び替え後の順序でsortを更新
      const updatedOrder = updatedTypes.map((data, index) => ({
          id: data.id,
          sort: index + 1
      }));

      const response = await fetch(`${url}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updatedOrder)
      });

      const data = await response.json();
      if (data.success) {
          successNoti(data.message);
      } else {
          errorNoti(data.message);
      }

  } catch (error) {
      console.error('Error updating order:', error);
  }
};

export default tableSort;