import { api } from '../../../lib/api';

export const labApi = {
    getOrders: async (params) => {
        const response = await api.get('v1/auth/diagnostics/orders/', { params });
        return response.data;
    },

    submitResult: async (id, data) => {
        const response = await api.post(`v1/auth/diagnostics/orders/${id}/submit-result/`, data);
        return response.data;
    }
};
