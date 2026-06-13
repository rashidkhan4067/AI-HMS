import { api } from '../../../lib/api';

export const receptionistApi = {
    getAppointments: async (params) => {
        const response = await api.get('v1/auth/appointments/', { params });
        return response.data;
    },

    getInvoices: async (params) => {
        const response = await api.get('v1/auth/invoices/', { params });
        return response.data;
    },

    createInvoice: async (data) => {
        const response = await api.post('v1/auth/invoices/', data);
        return response.data;
    },

    getPatients: async (params) => {
        const response = await api.get('v1/auth/patients/', { params });
        return response.data;
    },

    getDoctors: async (params) => {
        const response = await api.get('v1/auth/doctors/', { params });
        return response.data;
    }
};
