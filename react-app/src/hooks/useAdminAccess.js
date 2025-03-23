import useUserInfo from './useUserInfo';

const useAdminAccess = () => {
    const { isSystemDepartmentAdmin, isDepartmentAdmin } = useUserInfo();

    // 管理者または対象部署の管理者権限があるかをチェック
    const hasAdminAccess = (departmentName) => {
        return isSystemDepartmentAdmin() || isDepartmentAdmin(departmentName);
    };

    // 右クリックハンドラーをラップ
    const wrapContextMenu = (baseHandleContextMenu) => {
        return (event, id, departmentName) => {
            if (hasAdminAccess(departmentName)) {
                baseHandleContextMenu(event, id);
            }
        };
    };

    return {
        hasAdminAccess,
        wrapContextMenu
    };
};

export default useAdminAccess;