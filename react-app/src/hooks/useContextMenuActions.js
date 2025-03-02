import Modal from "../components/modal/Modal"
import ConfirmDeleteModal from "../components/modal/ConfirmDeleteModal"
import handleAPI from "../utils/handleAPI";

export const useContextMenuActions = (datas, hoveredRowId, url, messageKey, setIsMenuVisible, editTittle, FormComponent) => {
    const handleEdit = async () => {
        setIsMenuVisible(false)
        const data = datas.find((dept) => dept.id === hoveredRowId);
        if (data) {
            await Modal.call({
                title: editTittle,
                FormComponent: FormComponent,
                formProps: { editData: data }
            });
        }
    };

    const handleDelete = async () => {
        setIsMenuVisible(false)
        const data = datas.find((data) => data.id === hoveredRowId);
        if (data) {
            const confirmed = await ConfirmDeleteModal.call({
                message: `${data[messageKey]}を削除してもよろしいですか？`
            });

            if (confirmed) {
                const sendUrl = `${url}/${data.id}`
                await handleAPI(sendUrl, 'DELETE')
            }
        }
    };

    return { handleEdit, handleDelete };
};
