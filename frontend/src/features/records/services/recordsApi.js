import { api } from '../../../lib/api';

export const recordsApi = {
    getRecords: async (params) => {
        const response = await api.get('v1/auth/medical-records/', { params });
        return response.data;
    },

    createRecord: async (data) => {
        const response = await api.post('v1/auth/medical-records/', data);
        return response.data;
    },

    updateRecord: async (id, data) => {
        const response = await api.patch(`v1/auth/medical-records/${id}/`, data);
        return response.data;
    },

    getPatients: async (params) => {
        const response = await api.get('v1/auth/patients/', { params });
        return response.data;
    },

    createDiagnosticOrder: async (data) => {
        const response = await api.post('v1/auth/diagnostics/orders/', data);
        return response.data;
    },

    getDiagnosticOrders: async (params) => {
        const response = await api.get('v1/auth/diagnostics/orders/', { params });
        return response.data;
    },
};
