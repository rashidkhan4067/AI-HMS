import { api } from '../../../lib/api';

export const nurseApi = {
    getAppointments: async (params) => {
        const response = await api.get('v1/auth/appointments/', { params });
        return response.data;
    },

    getVitals: async (params) => {
        const response = await api.get('v1/auth/vitals/', { params });
        return response.data;
    },

    createVitals: async (data) => {
        const response = await api.post('v1/auth/vitals/', data);
        return response.data;
    }
};

export default nurseApi;
