import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useOtpTimer — Countdown timer for OTP resend cooldown.
 *
 * @param {number} initialSeconds  - How many seconds to count down (default 60)
 * @returns {{ secondsLeft, isActive, isExpired, start, reset }}
 */
export const useOtpTimer = (initialSeconds = 60) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive]       = useState(false);
    const intervalRef                   = useRef(null);

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const start = useCallback(() => {
        clearTimer();
        setSecondsLeft(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const reset = useCallback(() => {
        clearTimer();
        setSecondsLeft(initialSeconds);
        setIsActive(false);
    }, [initialSeconds]);

    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return clearTimer;
    }, [isActive]);

    // Formatted mm:ss string
    const formatted = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

    return {
        secondsLeft,
        formatted,
        isActive,
        isExpired: secondsLeft === 0 && !isActive,
        start,
        reset,
    };
};
