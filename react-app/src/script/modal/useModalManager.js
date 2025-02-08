import { useState } from 'react';


const useModalManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    return {
        isModalOpen,
        isDeleteModalOpen,
        selectedItem,
        openModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
    };
};

export default useModalManager;
