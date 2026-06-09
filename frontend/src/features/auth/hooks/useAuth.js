import { useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const MAX_ATTEMPTS  = 5;
const WARN_AFTER    = 3;
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

export const useAuth = () => {
    const context    = useContext(AuthContext);
    const navigate   = useNavigate();
    const location   = useLocation();
    const attemptsRef = useRef(
        parseInt(sessionStorage.getItem('loginAttempts') || '0', 10)
    );

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        success,
        login: contextLogin,
        loginWithGoogle: contextLoginWithGoogle,
        register: contextRegister,
        registerPatient: contextRegisterPatient,
        logout: contextLogout,
        getProfile,
        updateProfile,
        changePassword,
        setError,
    } = context;

    /** Returns { attemptsLeft, isWarning, isLocked } */
    const getLockStatus = () => {
        const n = attemptsRef.current;
        return {
            attempts:     n,
            attemptsLeft: Math.max(0, MAX_ATTEMPTS - n),
            isWarning:    n >= WARN_AFTER && n < MAX_ATTEMPTS,
            isLocked:     n >= MAX_ATTEMPTS,
        };
    };

    const login = async (email, password) => {
        // Check if already locked
        const lockUntil = parseInt(sessionStorage.getItem('lockUntil') || '0', 10);
        if (Date.now() < lockUntil) {
            const lockedEmail = sessionStorage.getItem('lockedEmail') || '';
            navigate('/locked', { state: { lockUntil, email: lockedEmail } });
            return false;
        }

        try {
            await contextLogin(email, password);

            // Successful login — clear attempt counter
            attemptsRef.current = 0;
            sessionStorage.removeItem('loginAttempts');
            sessionStorage.removeItem('lockUntil');
            sessionStorage.removeItem('lockedEmail');

            return true;
        } catch {
            // Increment failure counter
            attemptsRef.current += 1;
            sessionStorage.setItem('loginAttempts', String(attemptsRef.current));

            if (attemptsRef.current >= MAX_ATTEMPTS) {
                const lockUntilTime = Date.now() + LOCKOUT_MS;
                sessionStorage.setItem('lockUntil', String(lockUntilTime));
                sessionStorage.setItem('lockedEmail', email);
                navigate('/locked', { state: { lockUntil: lockUntilTime, email } });
            }

            return false;
        }
    };

    const loginWithGoogle = async (accessToken) => {
        try {
            await contextLoginWithGoogle(accessToken);

            // Successful login — clear attempt counter
            attemptsRef.current = 0;
            sessionStorage.removeItem('loginAttempts');
            sessionStorage.removeItem('lockUntil');

            return true;
        } catch {
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await contextRegister(userData);
            return true;
        } catch {
            return false;
        }
    };

    const registerPatient = async (patientData) => {
        try {
            await contextRegisterPatient(patientData);
            return true;
        } catch {
            return false;
        }
    };

    const logout = () => {
        contextLogout();
        navigate('/login');
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        success,
        login,
        loginWithGoogle,
        register,
        registerPatient,
        logout,
        getProfile,
        updateProfile,
        changePassword,
        setError,
        getLockStatus,
        profile: user,
    };
};
