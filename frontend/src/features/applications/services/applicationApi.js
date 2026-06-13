import { api as axiosInstance } from '../../../lib/api';

/**
 * Applications API Service — Al Shifaa HMS
 * Centralizes requests for listing, approving, and rejecting doctor onboarding applications.
 */
export const applicationApi = {
    getApplications: async () => {
        const response = await axiosInstance.get('auth/admin/applications/');
        return response.data;
    },

    approveApplication: async (id) => {
        const response = await axiosInstance.post(`auth/admin/applications/${id}/approve/`);
        return response.data;
    },

    rejectApplication: async (id, message) => {
        const response = await axiosInstance.post(`auth/admin/applications/${id}/reject/`, { message });
        return response.data;
    },
};

export default applicationApi;
