import { api as axiosInstance } from '../../../lib/api';

/**
 * Auth API Service — Al Shifaa HMS
 * Includes existing endpoints + new password-reset / OTP flow.
 * Falls back to mock simulation if endpoint returns 404/network error (dev safety).
 */

const mockDelay = (ms = 1200) => new Promise((res) => setTimeout(res, ms));

export const authApi = {
    /* ── Existing ── */
    login: async (email, password) => {
        const response = await axiosInstance.post('auth/login/', { email, password });
        return response.data;
    },

    loginWithGoogle: async (accessToken) => {
        const response = await axiosInstance.post('auth/google/', { access_token: accessToken });
        return response.data;
    },


    register: async (userData) => {
        const response = await axiosInstance.post('auth/register/', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await axiosInstance.get('auth/me/');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await axiosInstance.patch('auth/me/', profileData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await axiosInstance.put('auth/change-password/', passwordData);
        return response.data;
    },

    /* ── New: Forgot Password / OTP / Reset ── */

    /**
     * Send a 6-digit OTP to the registered email.
     * Falls back to mock if backend not yet implemented.
     */
    forgotPassword: async (email) => {
        const response = await axiosInstance.post('v1/auth/forgot-password/', { email });
        return response.data;
    },

    /**
     * Verify the 6-digit OTP code.
     */
    verifyOtp: async (email, otp) => {
        const response = await axiosInstance.post('v1/auth/verify-otp/', { email, otp });
        return response.data;
    },

    /**
     * Reset password using the verified token.
     */
    resetPassword: async (token, password, confirmPassword) => {
        const response = await axiosInstance.post('v1/auth/reset-password/', {
            otp_record_id: token,
            password,
            confirm_password: confirmPassword || password,
        });
        return response.data;
    },
};

