import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/baseURL';
import { errorNoti } from '../utils/noti';

const useUserInfo = () => {
    const [userDepartments, setUserDepartments] = useState([]);
    const [adminDepartments, setAdminDepartments] = useState(new Set());
    const [isSystemAdmin, setIsSystemAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    errorNoti('ユーザー情報の取得に失敗しました');
                }
                const data = await response.json();
                const departments = data.departments || [];

                // 権限情報を整理
                const adminDepts = new Set();
                let isAdmin = false;

                departments.forEach(dept => {
                    if (dept.admin) {
                        adminDepts.add(dept.name);
                        if (dept.name === '管理者') {
                            isAdmin = true;
                        }
                    }
                });

                setUserDepartments(departments);
                setAdminDepartments(adminDepts);
                setIsSystemAdmin(isAdmin);
                setError(null);
            } catch (error) {
                console.error('ユーザー情報取得エラー:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    // 特定の部署の管理者かどうかを確認
    const isDepartmentAdmin = (departmentName) => {
        return adminDepartments.has(departmentName);
    };

    // いずれかの部署で管理者権限を持っているかどうかを確認
    const hasAnyAdminAccess = () => {
        return adminDepartments.size > 0;
    };

    // システム管理者かどうかを確認
    const isSystemDepartmentAdmin = () => {
        return isSystemAdmin;
    };

    return {
        userDepartments,
        isLoading,
        error,
        isDepartmentAdmin,
        hasAnyAdminAccess,
        isSystemDepartmentAdmin
    };
};

export default useUserInfo;