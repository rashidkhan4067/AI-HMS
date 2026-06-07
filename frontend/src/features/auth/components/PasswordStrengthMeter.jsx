import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

const STRENGTH_LEVELS = [
    { label: 'Weak', barColor: '#EF4444', textColor: '#DC2626' },   // bg-red-500, text-red-600
    { label: 'Fair', barColor: '#FB923C', textColor: '#F97316' },   // bg-orange-400, text-orange-500
    { label: 'Good', barColor: '#FACC15', textColor: '#CA8A04' },   // bg-yellow-400, text-yellow-600
    { label: 'Strong', barColor: '#10B981', textColor: '#059669' }, // bg-emerald-500, text-emerald-600
];

const getStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
    return score;
};

const REQUIREMENTS = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter',       test: (p) => /[A-Z]/.test(p) },
    { label: 'Number or symbol',       test: (p) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

const PasswordStrengthMeter = ({ password = '' }) => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const strength = getStrength(password);
    const level = STRENGTH_LEVELS[strength - 1];

    if (!password) return null;

    return (
        <Box sx={{ mt: -0.5, mb: 1.5 }}>
            {/* Top row containing the 4 segment bars and the strength label */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: 1.5,
                    gap: 2,
                }}
            >
                {/* 4 Segment Bars */}
                <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
                    {Array.from({ length: 4 }).map((_, idx) => {
                        const isFilled = idx < strength;
                        return (
                            <Box
                                key={idx}
                                sx={{
                                    flex: 1,
                                    height: 6, // h-1.5 (6px)
                                    borderRadius: '9999px',
                                    backgroundColor: isDark ? '#374151' : '#E5E7EB', // bg-gray-700 / bg-gray-200
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    component={motion.div}
                                    initial={{ width: '0%' }}
                                    animate={{ width: isFilled ? '100%' : '0%' }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        backgroundColor: isFilled ? level.barColor : 'transparent',
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Box>

                {/* Strength Label on the right */}
                {strength > 0 && (
                    <Typography
                        sx={{
                            fontSize: '12px', // text-xs
                            fontWeight: 500, // font-medium
                            fontFamily: "'DM Sans', sans-serif",
                            color: level.textColor,
                            minWidth: 44,
                            textAlign: 'right',
                        }}
                    >
                        {level.label}
                    </Typography>
                )}
            </Box>

            {/* Requirements checklist */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {REQUIREMENTS.map((req) => {
                    const met = req.test(password);
                    return (
                        <Box key={req.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: met ? '#1D6B35' : 'rgba(0,106,106,0.1)',
                                    transition: 'background-color 0.25s ease',
                                    flexShrink: 0,
                                }}
                            >
                                {met && <Check size={10} color="#fff" strokeWidth={3} />}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: met ? '#1D6B35' : 'text.disabled',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'color 0.25s ease',
                                    fontSize: '11px',
                                }}
                            >
                                {req.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default PasswordStrengthMeter;
