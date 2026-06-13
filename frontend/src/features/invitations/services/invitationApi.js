import { api as axiosInstance } from '../../../lib/api';

/**
 * Invitations API Service — Al Shifaa HMS
 * Centralizes requests for staff invite generation, revocation, and resending.
 */
export const invitationApi = {
    getInvites: async () => {
        const response = await axiosInstance.get('auth/admin/invites/');
        return response.data;
    },

    createInvite: async (inviteData) => {
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
};

export default invitationApi;
