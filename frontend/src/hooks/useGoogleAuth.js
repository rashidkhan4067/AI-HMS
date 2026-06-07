import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';

export const useGoogleAuth = () => {
    const { loginWithGoogle: contextLoginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lockoutTime, setLockoutTime] = useState(0);
    const countdownIntervalRef = useRef(null);

    const startLockoutCountdown = (lockedUntilIso) => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        const lockedUntil = new Date(lockedUntilIso).getTime();

        const updateTimer = () => {
            const timeLeft = lockedUntil - Date.now();
            if (timeLeft <= 0) {
                setError(null);
                setLockoutTime(0);
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
            } else {
                const seconds = Math.ceil(timeLeft / 1000);
                setLockoutTime(seconds);
                const minutesStr = String(Math.floor(seconds / 60)).padStart(2, '0');
                const secondsStr = String(seconds % 60).padStart(2, '0');
                setError(`Your account is temporarily locked. Please try again in ${minutesStr}:${secondsStr}`);
            }
        };

        updateTimer();
        countdownIntervalRef.current = setInterval(updateTimer, 1000);
    };

    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, []);

    const handleSuccess = async (tokenResponse) => {
        setIsLoading(true);
        setError(null);
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            setLockoutTime(0);
        }

        try {
            await contextLoginWithGoogle(tokenResponse.access_token, true);
        } catch (err) {
            const errCode = err.error || err.response?.data?.error || err.detail;
            if (errCode === 'not_registered') {
                setError('Your email is not registered in this hospital system');
            } else if (errCode === 'inactive_account') {
                setError('Your account is pending administrator approval');
            } else if (errCode === 'account_locked') {
                const lockedUntil = err.locked_until || err.response?.data?.locked_until;
                if (lockedUntil) {
                    startLockoutCountdown(lockedUntil);
                } else {
                    setError('Your account is temporarily locked.');
                }
            } else {
                setError(err.detail || err.response?.data?.detail || 'Google authentication failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (errorResponse) => {
        console.error("Google Auth error:", errorResponse);
        setError("Google authentication was cancelled or failed.");
        setIsLoading(false);
    };

    // Initialize the official Google Login hook
    const loginTrigger = useGoogleLogin({
        flow: 'implicit',
        onSuccess: handleSuccess,
        onError: handleError,
    });

    // Custom trigger wrapper that intercepts window.open to apply precise popup sizing
    const googleLogin = () => {
        const originalWindowOpen = window.open;
        
        window.open = function (url, name, features) {
            // Revert override immediately so other window.open calls behave normally
            window.open = originalWindowOpen;

            // Enforce a compact and centered size for Google authentication popup
            const width = 500;
            const height = 600;
            
            const parentWidth = window.top.outerWidth || window.screen.width;
            const parentHeight = window.top.outerHeight || window.screen.height;
            const parentX = window.top.screenX !== undefined ? window.top.screenX : window.screenLeft;
            const parentY = window.top.screenY !== undefined ? window.top.screenY : window.screenTop;

            const left = parentX + (parentWidth - width) / 2;
            const top = parentY + (parentHeight - height) / 2;

            const customFeatures = `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`;

            // Call the original window.open with our compact features
            return originalWindowOpen.call(this, url, name, customFeatures);
        };

        // Call the official hook trigger
        loginTrigger();
    };

    return {
        googleLogin,
        isLoading,
        error,
        lockoutTime,
    };
};
