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

    unlockUser: async (id) => {
        const response = await axiosInstance.post(`auth/admin/users/${id}/unlock/`);
        return response.data;
    },

    getSystemHealth: async () => {
        const response = await axiosInstance.get('auth/admin/health-check/');
        return response.data;
    },

    // PMDC Compliance & Billing Reconciliation
    getPMDCCompliance: async () => {
        const response = await axiosInstance.get('auth/admin/compliance/pmdc/');
        return response.data;
    },

    getRevenueReconciliation: async () => {
        const response = await axiosInstance.get('auth/admin/billing/reconcile/');
        return response.data;
    },

    getBillingOversight: async () => {
        const response = await axiosInstance.get('auth/admin/billing/oversight/');
        return response.data;
    },

    updateDoctorProfile: async (id, data) => {
        const response = await axiosInstance.patch(`auth/doctors/${id}/`, data);
        return response.data;
    },

    // IPD Wards, Beds & Admissions
    getWards: async () => {
        const response = await axiosInstance.get('auth/ipd/wards/');
        return response.data;
    },

    createWard: async (wardData) => {
        const response = await axiosInstance.post('auth/ipd/wards/', wardData);
        return response.data;
    },

    updateWard: async (id, wardData) => {
        const response = await axiosInstance.patch(`auth/ipd/wards/${id}/`, wardData);
        return response.data;
    },

    deleteWard: async (id) => {
        const response = await axiosInstance.delete(`auth/ipd/wards/${id}/`);
        return response.data;
    },

    getBeds: async () => {
        const response = await axiosInstance.get('auth/ipd/beds/');
        return response.data;
    },

    createBed: async (bedData) => {
        const response = await axiosInstance.post('auth/ipd/beds/', bedData);
        return response.data;
    },

    updateBed: async (id, bedData) => {
        const response = await axiosInstance.patch(`auth/ipd/beds/${id}/`, bedData);
        return response.data;
    },

    deleteBed: async (id) => {
        const response = await axiosInstance.delete(`auth/ipd/beds/${id}/`);
        return response.data;
    },

    getAdmissions: async () => {
        const response = await axiosInstance.get('auth/ipd/admissions/');
        return response.data;
    },

    createAdmission: async (admissionData) => {
        const response = await axiosInstance.post('auth/ipd/admissions/', admissionData);
        return response.data;
    },

    dischargeAdmission: async (id) => {
        const response = await axiosInstance.post(`auth/ipd/admissions/${id}/discharge/`);
        return response.data;
    },

    // Duty Rostering
    getRosters: async () => {
        const response = await axiosInstance.get('auth/rosters/');
        return response.data;
    },

    createRoster: async (rosterData) => {
        const response = await axiosInstance.post('auth/rosters/', rosterData);
        return response.data;
    },

    updateRoster: async (id, rosterData) => {
        const response = await axiosInstance.patch(`auth/rosters/${id}/`, rosterData);
        return response.data;
    },

    deleteRoster: async (id) => {
        const response = await axiosInstance.delete(`auth/rosters/${id}/`);
        return response.data;
    },

    // Appointment Overview
    getAppointments: async (params = {}) => {
        const response = await axiosInstance.get('auth/appointments/', { params });
        return response.data;
    },

    updateAppointment: async (id, data) => {
        const response = await axiosInstance.patch(`auth/appointments/${id}/`, data);
        return response.data;
    },

    deleteAppointment: async (id) => {
        const response = await axiosInstance.delete(`auth/appointments/${id}/`);
        return response.data;
    },

    // Department log listings for admin auditing
    getPharmacyDispenses: async () => {
        const response = await axiosInstance.get('auth/dispenses/');
        return response.data;
    },

    getDiagnosticOrders: async (params = {}) => {
        const response = await axiosInstance.get('auth/diagnostics/orders/', { params });
        return response.data;
    },
};
