import React, { Suspense, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/baseURL';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, endpoint }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (isMounted) {
                    if (response.status === 403 || response.status === 401) {
                        setIsAuthorized(false);
                    } else {
                        setIsAuthorized(true);
                    }
                    setIsChecking(false);
                }
            } catch (error) {
                console.error('認証チェックエラー:', error);
                if (isMounted) {
                    setIsAuthorized(false);
                    setIsChecking(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [endpoint]);

    if (isChecking) {
        return null;
    }

    if (!isAuthorized) {
        return <Navigate to="/403" state={{ from: location }} replace />;
    }

    return (
        <Suspense fallback={null}>
            {children}
        </Suspense>
    );
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    endpoint: PropTypes.string.isRequired
};

export default ProtectedRoute;