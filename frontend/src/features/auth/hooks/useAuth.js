import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            navigate('/dashboard');
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials or server error.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await authApi.register(userData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please verify your inputs.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const updateProfile = async (profileData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.updateProfile(profileData);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.changePassword(passwordData);
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password.';
            setError(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, register, logout, updateProfile, changePassword, isLoading, error, success, setError };
};
