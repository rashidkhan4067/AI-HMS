import { useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * OtpInputGroup — 6 single-digit JetBrains Mono inputs.
 * Features: auto-focus-next, backspace-focus-prev, paste detection, shake animation on error.
 *
 * Props:
 *   value       string[6]   - Array of 6 single-digit strings
 *   onChange    (val: string[]) => void
 *   hasError    boolean     - triggers shake animation
 *   disabled    boolean
 */
const OtpInputGroup = ({ value = Array(6).fill(''), onChange, hasError = false, disabled = false }) => {
    const inputRefs = useRef([]);

    const focusNext = (idx) => {
        if (idx < 5) inputRefs.current[idx + 1]?.focus();
    };
    const focusPrev = (idx) => {
        if (idx > 0) inputRefs.current[idx - 1]?.focus();
    };

    const handleChange = useCallback((e, idx) => {
        const raw = e.target.value.replace(/\D/g, '').slice(-1); // only last digit
        const next = [...value];
        next[idx] = raw;
        onChange(next);
        if (raw) focusNext(idx);
    }, [value, onChange]);

    const handleKeyDown = useCallback((e, idx) => {
        if (e.key === 'Backspace') {
            if (!value[idx]) focusPrev(idx);
            const next = [...value];
            next[idx] = '';
            onChange(next);
        } else if (e.key === 'ArrowLeft') {
            focusPrev(idx);
        } else if (e.key === 'ArrowRight') {
            focusNext(idx);
        }
    }, [value, onChange]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = Array(6).fill('');
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        onChange(next);
        // Focus the cell after last pasted digit
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    }, [onChange]);

    // Shake animation keyframes
    const shakeVariants = {
        idle:  { x: 0 },
        shake: {
            x: [-6, 6, -4, 4, -2, 2, 0],
            transition: { duration: 0.5, ease: 'easeInOut' },
        },
    };

    return (
        <motion.div
            variants={shakeVariants}
            animate={hasError ? 'shake' : 'idle'}
            key={hasError ? 'shake' : 'idle'}
        >
            <Box
                sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 1.5 },
                    justifyContent: 'center',
                }}
            >
                {Array(6).fill(null).map((_, idx) => (
                    <Box
                        key={idx}
                        component="input"
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[idx] || ''}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        onChange={(e) => handleChange(e, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        onFocus={(e) => e.target.select()}
                        disabled={disabled}
                        autoComplete="one-time-code"
                        aria-label={`OTP digit ${idx + 1}`}
                        id={`otp-digit-${idx + 1}`}
                        className="otp-input"
                        sx={{
                            width: { xs: 44, sm: 52 },
                            height: { xs: 56, sm: 64 },
                            border: '2px solid',
                            borderColor: hasError
                                ? '#BA1A1A'
                                : value[idx]
                                    ? '#006A6A'
                                    : 'rgba(0,106,106,0.25)',
                            borderRadius: '12px',
                            backgroundColor: value[idx]
                                ? 'rgba(0,106,106,0.06)'
                                : 'rgba(0,106,106,0.02)',
                            color: hasError ? '#BA1A1A' : '#006A6A',
                            outline: 'none',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                            '&:focus': {
                                borderColor: hasError ? '#BA1A1A' : '#006A6A',
                                boxShadow:  hasError
                                    ? '0 0 0 3px rgba(186,26,26,0.18)'
                                    : '0 0 0 3px rgba(0,106,106,0.18)',
                                backgroundColor: 'rgba(0,106,106,0.06)',
                            },
                            '&:disabled': {
                                opacity: 0.5,
                                cursor: 'not-allowed',
                            },
                        }}
                    />
                ))}
            </Box>
        </motion.div>
    );
};

export default OtpInputGroup;
