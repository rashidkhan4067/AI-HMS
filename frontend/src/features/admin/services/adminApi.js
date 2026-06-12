import { api as axiosInstance } from '../../../lib/api';

/**
 * Admin API Service — Al Shifaa HMS
 * Encapsulates requests to fetch/update admin layout stats,
 * staff invite tokens, doctor onboard reviews, active users, and security logs.
 */
export const adminApi = {
    getDashboardData: async () => {
        const response = await axiosInstance.get('auth/admin/dashboard-data/');
        return response.data;
    },

    getOverview: async () => {
        const response = await axiosInstance.get('auth/admin/overview/');
        return response.data;
    },

    getInvites: async () => {
        const response = await axiosInstance.get('auth/admin/invites/');
        return response.data;
    },

    createInvite: async (inviteData) => {
        // inviteData should have: { email, role, department }
        const response = await axiosInstance.post('auth/admin/invites/', inviteData);
        return response.data;
    },

    revokeInvite: async (id) => {
        const response = await axiosInstance.delete(`auth/admin/invites/${id}/`);
        return response.data;
    },

    resendInvite: async (id) => {
        const response = await axiosInstance.post(`auth/admin/invites/${id}/resend/`);
        return response.data;
    },

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

    getUsers: async () => {
        const response = await axiosInstance.get('auth/admin/users/');
        return response.data;
    },

    toggleUserActive: async (id) => {
        const response = await axiosInstance.post(`auth/admin/users/${id}/toggle-active/`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await axiosInstance.patch(`auth/admin/users/${id}/`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`auth/admin/users/${id}/`);
        return response.data;
    },

    getAudits: async () => {
        const response = await axiosInstance.get('auth/admin/audits/');
        return response.data;
    },
};
