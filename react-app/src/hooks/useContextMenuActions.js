export const useContextMenuActions = (datas, hoveredRowId, openModal, openDeleteModal, setIsMenuVisible) => {
  const handleEdit = () => {
      const data = datas.find((dept) => dept.id === hoveredRowId);
      if (data) {
          openModal(data);
          setIsMenuVisible(false);
      }
  };

  const handleDelete = () => {
      const data = datas.find((data) => data.id === hoveredRowId);
      if (data) {
          openDeleteModal(data);
          setIsMenuVisible(false);
      }
  };

  return { handleEdit, handleDelete };
};
