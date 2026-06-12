import { api } from '../../../lib/api';

export const schedulingApi = {
    getDoctors: async (params) => {
        const response = await api.get('v1/auth/doctors/', { params });
        return response.data;
    },

    getDoctorAvailabilities: async (doctorId) => {
        const response = await api.get('v1/auth/doctor-availabilities/', {
            params: { doctor_id: doctorId }
        });
        return response.data;
    },

    createDoctorAvailability: async (data) => {
        const response = await api.post('v1/auth/doctor-availabilities/', data);
        return response.data;
    },

    deleteDoctorAvailability: async (id) => {
        const response = await api.delete(`v1/auth/doctor-availabilities/${id}/`);
        return response.data;
    },

    getAppointments: async (params) => {
        const response = await api.get('v1/auth/appointments/', { params });
        return response.data;
    },

    createAppointment: async (data) => {
        const response = await api.post('v1/auth/appointments/', data);
        return response.data;
    },

    updateAppointmentStatus: async (id, status) => {
        const response = await api.patch(`v1/auth/appointments/${id}/`, { status });
        return response.data;
    },
};
