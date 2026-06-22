/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api, setAccessToken, injectAuthCallbacks } from '../lib/api';

const isPathAllowedForUser = (path, user) => {
    if (!path || !user) return false;
    const role = user.role;
    const crossRoles = user.cross_authorized_roles || [];
    const checkRole = (r) => role === r || crossRoles.includes(r);
    
    // Check role-specific dashboard paths
    if (path.startsWith('/admin')) {
        return checkRole('ADMIN');
    }
    if (path.startsWith('/doctor')) {
        return checkRole('DOCTOR');
    }
    if (path.startsWith('/nurse')) {
        return checkRole('NURSE');
    }
    if (path.startsWith('/receptionist') || path.startsWith('/reception')) {
        return checkRole('RECEPTIONIST');
    }
    if (path.startsWith('/pharmacist') || path.startsWith('/pharmacy')) {
        return checkRole('PHARMACIST');
    }
    if (path.startsWith('/lab')) {
        return checkRole('LAB_TECHNICIAN');
    }
    if (path.startsWith('/radiology')) {
        return checkRole('RADIOLOGIST');
    }
    
    // General protected routes
    const generalProtectedPaths = ['/dashboard', '/forbidden', '/profile', '/auth/complete-profile'];
    if (generalProtectedPaths.some(p => path.startsWith(p))) {
        const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST'];
        return validRoles.some(r => checkRole(r));
    }
    
    // Public paths are always allowed
    return true;
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const accessTokenRef = useRef(null);

    const refreshPromiseRef = useRef(null);

    const refreshAccessToken = useCallback(async () => {
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }

        const runRefresh = async () => {
            try {
                const response = await api.post('v1/auth/token/refresh/');
                const newAccessToken = response.data.access;
                
                accessTokenRef.current = newAccessToken;
                setAccessToken(newAccessToken);

                const decoded = jwtDecode(newAccessToken);
                const loggedInUser = {
                    email: decoded.email,
                    role: decoded.role,
                    id: decoded.user_id,
                    full_name: decoded.full_name || '',
                    must_complete_profile: decoded.must_complete_profile ?? false,
                    cross_authorized_roles: decoded.cross_authorized_roles || [],
                };

                setUser(loggedInUser);
                setIsAuthenticated(true);
                return newAccessToken;
            } catch (err) {
                accessTokenRef.current = null;
                setAccessToken(null);
                setUser(null);
                setIsAuthenticated(false);
                throw err;
            } finally {
                setIsLoading(false);
                refreshPromiseRef.current = null;
            }
        };

        refreshPromiseRef.current = runRefresh();
        return refreshPromiseRef.current;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('v1/auth/logout/');
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            localStorage.removeItem('alshifaa_admin_cache');
            accessTokenRef.current = null;
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // Inject callbacks into Axios instance to handle interceptor requirements
    useEffect(() => {
        injectAuthCallbacks(logout, refreshAccessToken);
    }, [logout, refreshAccessToken]);

    // On App mount, attempt silent refresh instantly
    useEffect(() => {
        const initializeAuth = async () => {
            console.log("AuthContext: initializeAuth started...");
            try {
                await refreshAccessToken();
                console.log("AuthContext: refreshAccessToken succeeded");
            } catch (err) {
                console.log("AuthContext: refreshAccessToken failed/no active secure session detected on mount.", err);
            } finally {
                console.log("AuthContext: setting isLoading to false");
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, [refreshAccessToken]);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('v1/auth/login/', { email, password });
            const token = response.data.access;
            
            accessTokenRef.current = token;
            setAccessToken(token);

            const decoded = jwtDecode(token);
            const loggedInUser = {
                email: decoded.email,
                role: decoded.role,
                id: decoded.user_id,
                full_name: decoded.full_name || '',
                must_complete_profile: decoded.must_complete_profile ?? false,
                cross_authorized_roles: decoded.cross_authorized_roles || [],
            };

            setUser(loggedInUser);
            setIsAuthenticated(true);

            // Handle role-based redirects and saved paths
            if (loggedInUser.must_complete_profile) {
                navigate('/auth/complete-profile');
            } else {
                const redirectPath = response.data.redirect_to || '/dashboard';
                const savedPath = location.state?.from?.pathname;
                
                let targetPath = redirectPath;
                if (savedPath && isPathAllowedForUser(savedPath, loggedInUser)) {
                    targetPath = savedPath;
                }
                navigate(targetPath);
            }

            return loggedInUser;
        } catch (err) {
            const errData = err.response?.data || { detail: 'Invalid credentials or server error.' };
            setError(errData);
            throw errData;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (googleToken, isAccessToken = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = isAccessToken ? { access_token: googleToken } : { id_token: googleToken };
            const response = await api.post('v1/auth/google/', payload);
            const token = response.data.access;
            
            accessTokenRef.current = token;
            setAccessToken(token);

            const decoded = jwtDecode(token);
            const loggedInUser = {
                email: decoded.email,
                role: decoded.role,
                id: decoded.user_id,
                full_name: decoded.full_name || '',
                must_complete_profile: decoded.must_complete_profile ?? false,
                cross_authorized_roles: decoded.cross_authorized_roles || [],
            };

            setUser(loggedInUser);
            setIsAuthenticated(true);

            // Handle role-based redirects and saved paths
            if (loggedInUser.must_complete_profile) {
                navigate('/auth/complete-profile');
            } else {
                const redirectPath = response.data.redirect_to || '/dashboard';
                const savedPath = location.state?.from?.pathname;
                
                let targetPath = redirectPath;
                if (savedPath && isPathAllowedForUser(savedPath, loggedInUser)) {
                    targetPath = savedPath;
                }
                navigate(targetPath);
            }

            return response.data;
        } catch (err) {
            const errData = err.response?.data || { detail: 'Google authentication failed.' };
            setError(errData);
            throw errData;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await api.post('v1/auth/register/', userData);
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errData = err.response?.data || { detail: 'Registration failed. Please verify your inputs.' };
            setError(errData);
            throw errData;
        } finally {
            setIsLoading(false);
        }
    };

    const registerPatient = async (patientData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('v1/auth/register-patient/', patientData);
            const token = response.data.access;
            
            accessTokenRef.current = token;
            setAccessToken(token);

            const decoded = jwtDecode(token);
            const loggedInUser = {
                email: decoded.email,
                role: decoded.role,
                id: decoded.user_id,
                full_name: decoded.full_name || '',
                must_complete_profile: decoded.must_complete_profile ?? false,
            };

            setUser(loggedInUser);
            setIsAuthenticated(true);
            return response.data;
        } catch (err) {
            const errData = err.response?.data || { detail: 'Registration failed. Please verify your inputs.' };
            setError(errData);
            throw errData;
        } finally {
            setIsLoading(false);
        }
    };


    const getProfile = useCallback(async () => {
        setError(null);
        try {
            const response = await api.get('v1/auth/me/');
            setUser(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data || { detail: 'Failed to fetch profile.' });
            return null;
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        setError(null);
        try {
            const response = await api.patch('v1/auth/me/', profileData);
            setUser(response.data);
            return true;
        } catch (err) {
            setError(err.response?.data || { detail: 'Failed to update profile.' });
            return false;
        }
    }, []);

    const changePassword = useCallback(async (passwordData) => {
        setError(null);
        try {
            await api.put('v1/auth/change-password/', passwordData);
            return true;
        } catch (err) {
            setError(err.response?.data || { detail: 'Failed to change password.' });
            return false;
        }
    }, []);

    const completeProfile = useCallback(async (profileData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.patch('v1/auth/complete-profile/', profileData);
            const newAccessToken = response.data.access;

            // Update in-memory access token
            setAccessToken(newAccessToken);

            // Decode fresh token and update user context
            const decoded = jwtDecode(newAccessToken);
            const updatedUser = {
                email: decoded.email,
                role: decoded.role,
                id: decoded.user_id,
                full_name: decoded.full_name || '',
                must_complete_profile: false,
                cross_authorized_roles: decoded.cross_authorized_roles || [],
            };
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            const errData = err.response?.data || { detail: 'Failed to complete profile.' };
            setError(errData);
            throw errData;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const hasRole = useCallback((...roles) => {
        return user && roles.includes(user.role);
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            error,
            success,
            login,
            loginWithGoogle,
            register,
            registerPatient,
            logout,
            getProfile,
            updateProfile,
            changePassword,
            completeProfile,
            hasRole,
            refreshAccessToken,
            setError,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
