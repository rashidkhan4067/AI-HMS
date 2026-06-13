import { api } from '../../../lib/api';

export const pharmacyApi = {
    getDispenses: async (params) => {
        const response = await api.get('v1/auth/dispenses/', { params });
        return response.data;
    },

    getDispenseDetail: async (id) => {
        const response = await api.get(`v1/auth/dispenses/${id}/`);
        return response.data;
    },

    dispensePrescription: async (id, data) => {
        const response = await api.patch(`v1/auth/dispenses/${id}/`, data);
        return response.data;
    }
};
