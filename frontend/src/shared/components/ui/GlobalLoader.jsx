import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

/**
 * GlobalLoader — A state-of-the-art, premium full-page loader.
 * Uses a glassmorphic background, a heartbeat-pulsating clinical logo, 
 * and a glowing, rotating neon gradient ring.
 *
 * Props:
 *   message     string   - Custom status text to show under the loader
 *   fullScreen  boolean  - Whether to render as fixed full-screen overlay or relative box
 */
export const GlobalLoader = ({ message = 'Loading Al Shifaa...', fullScreen = true }) => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    // Heartbeat pulse keyframes (simulating a double contraction of the heart)
    const heartbeatVariants = {
        pulse: {
            scale: [1, 1.08, 0.98, 1.15, 1],
            filter: [
                'drop-shadow(0 0 12px rgba(0, 106, 106, 0.2))',
                'drop-shadow(0 0 24px rgba(0, 106, 106, 0.45))',
                'drop-shadow(0 0 10px rgba(0, 106, 106, 0.15))',
                'drop-shadow(0 0 32px rgba(0, 106, 106, 0.6))',
                'drop-shadow(0 0 12px rgba(0, 106, 106, 0.2))'
            ],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const loaderContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                textAlign: 'center',
                position: 'relative',
                zIndex: 10,
            }}
        >
            {/* Glowing Loader Orbit Rings */}
            <Box
                sx={{
                    position: 'relative',
                    width: 140,
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                {/* Rotating Dotted Outer Orbit */}
                <Box
                    component={motion.div}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px dotted rgba(0, 106, 106, 0.15)',
                    }}
                />

                {/* Rotating Neon Gradient Inner Ring */}
                <Box
                    component={motion.div}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    sx={{
                        position: 'absolute',
                        width: '88%',
                        height: '88%',
                        borderRadius: '50%',
                        border: '3px solid transparent',
                        borderTopColor: '#006A6A',
                        borderBottomColor: '#4DB6AC',
                        filter: 'drop-shadow(0 0 8px rgba(0, 106, 106, 0.35))',
                        opacity: 0.85,
                    }}
                />

                {/* Second offset ring for extra premium visual complexity */}
                <Box
                    component={motion.div}
                    animate={{ rotate: 180 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    sx={{
                        position: 'absolute',
                        width: '76%',
                        height: '76%',
                        borderRadius: '50%',
                        border: '1px dashed rgba(0, 106, 106, 0.3)',
                    }}
                />

                {/* Center Solid White/Teal Glass Sphere for Logo */}
                <Box
                    component={motion.div}
                    variants={heartbeatVariants}
                    animate="pulse"
                    sx={{
                        position: 'absolute',
                        width: '64%',
                        height: '64%',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark
                            ? 'radial-gradient(circle, rgba(22, 29, 29, 0.95) 0%, rgba(15, 21, 21, 0.9) 100%)'
                            : 'radial-gradient(circle, #FFFFFF 0%, rgba(244, 251, 251, 0.9) 100%)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 106, 106, 0.12)',
                        boxShadow: '0 8px 32px 0 rgba(0, 106, 106, 0.15)',
                        zIndex: 2,
                    }}
                >
                    {/* Render only the Icon part of the brand logo in the circle */}
                    <BrandLogo size={42} showText={false} />
                </Box>
            </Box>

            {/* Dynamic Status Text */}
            <Box sx={{ mt: 1, position: 'relative' }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 600,
                        fontSize: '18px',
                        letterSpacing: '-0.2px',
                        color: isDark ? '#E0F2F1' : '#161D1D',
                        mb: 0.5,
                    }}
                >
                    Al Shifaa
                </Typography>
                
                <Typography
                    variant="body2"
                    component={motion.p}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,106,106,0.7)',
                        letterSpacing: '0.2px',
                    }}
                >
                    {message}
                </Typography>
            </Box>
        </Box>
    );

    if (!fullScreen) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    minHeight: 200,
                    position: 'relative',
                }}
            >
                {loaderContent}
            </Box>
        );
    }

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark
                    ? 'radial-gradient(circle at center, #0B1111 0%, #050808 100%)'
                    : 'radial-gradient(circle at center, #FFFFFF 0%, #E8F5F5 100%)',
                zIndex: 99999,
                overflow: 'hidden',
                // Glassmorphic overlay effect on elements underneath
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Subtle floating medical background dots */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: isDark ? 0.03 : 0.05,
                    backgroundImage: 'radial-gradient(#006A6A 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                }}
            />
            {loaderContent}
        </Box>
    );
};
