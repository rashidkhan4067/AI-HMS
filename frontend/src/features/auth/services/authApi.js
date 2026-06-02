import { axiosInstance } from '../../../shared/services/axios';

export const authApi = {
    login: async (email, password) => {
        const response = await axiosInstance.post('auth/login/', { email, password });
        return response.data;
    },
    
    register: async (userData) => {
        const response = await axiosInstance.post('auth/register/', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await axiosInstance.get('auth/me/');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await axiosInstance.patch('auth/me/', profileData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await axiosInstance.put('auth/change-password/', passwordData);
        return response.data;
    }
};
