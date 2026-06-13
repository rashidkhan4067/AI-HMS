import { api as axiosInstance } from '../../../lib/api';

/**
 * Centralized Department API Service — Al Shifaa HMS
 * Used by admin management console and other user registration modules.
 */
export const departmentApi = {
    /**
     * Public endpoint to get active departments (for dropdown selection)
     */
    getPublicList: async () => {
        const response = await axiosInstance.get('auth/departments/');
        return response.data;
    },

    /**
     * Admin endpoints
     */
    getAdminList: async () => {
        const response = await axiosInstance.get('auth/admin/departments/');
        return response.data;
    },

    createDepartment: async (data) => {
        const response = await axiosInstance.post('auth/admin/departments/', data);
        return response.data;
    },

    updateDepartment: async (id, data) => {
        const response = await axiosInstance.patch(`auth/admin/departments/${id}/`, data);
        return response.data;
    },

    deleteDepartment: async (id) => {
        const response = await axiosInstance.delete(`auth/admin/departments/${id}/`);
        return response.data;
    },
};

export default departmentApi;
