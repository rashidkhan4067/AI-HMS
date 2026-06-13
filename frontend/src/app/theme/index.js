import { createTheme } from '@mui/material/styles';
import { getPalette } from './palette';
import { typography } from './typography';
import { spacing, breakpoints } from './spacing';

/**
 * Al Shifaa HMS — MD3 Clinical Theme
 * MUI theme with clinical teal, DM Sans typography, MD3 shape tokens,
 * and tonal surface overlays per Material Design 3 spec.
 */
export const getThemeConfig = (mode) => {
    const palette = getPalette(mode);
    const isDark = mode === 'dark';

    // Tonal surface colors
    const tealsurface1 = isDark ? 'rgba(156,241,240,0.05)' : 'rgba(0,106,106,0.05)';
    const tealFocusRing = isDark
        ? '0 0 0 3px rgba(156,241,240,0.35)'
        : '0 0 0 3px rgba(0,106,106,0.18)';

    return createTheme({
        palette,
        typography: {
            ...typography,
            fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
            h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '-0.5px' },
            h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
            h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
            h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
            h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
            h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
            body1: { fontFamily: "'DM Sans', sans-serif" },
            body2: { fontFamily: "'DM Sans', sans-serif" },
            caption: { fontFamily: "'DM Sans', sans-serif" },
            button: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
        },
        spacing,
        shape: {
            borderRadius: 12,   // MD3 base — input fields, buttons
        },
        breakpoints,
        components: {
            /* ── Button ── MD3 filled/outlined/text variants */
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: '48px',          // WCAG 2.1 touch target
                        borderRadius: 12,            // MD3 shape.md
                        padding: '10px 24px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { transform: 'translateY(-1px)' },
                        '&:active': { transform: 'translateY(0)' },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                            boxShadow: isDark
                                ? '0 4px 16px rgba(156,241,240,0.2)'
                                : '0 4px 16px rgba(0,106,106,0.25)',
                        },
                    },
                    outlinedPrimary: {
                        borderColor: isDark ? 'rgba(156,241,240,0.35)' : 'rgba(0,106,106,0.35)',
                        '&:hover': {
                            borderColor: '#006A6A',
                            backgroundColor: tealsurface1,
                        },
                    },
                },
            },

            /* ── TextField / OutlinedInput — MD3 style ── */
            MuiTextField: {
                defaultProps: { variant: 'outlined', fullWidth: true },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        fontFamily: "'DM Sans', sans-serif",
                        borderRadius: 12, // rounded-xl (12px)
                        height: 44, // h-11 (44px)
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        
                        // Fix for multiline text fields to allow height to auto-adjust
                        '&.MuiInputBase-multiline': {
                            height: 'auto',
                            padding: 0,
                        },
                        
                        // Default border (resting state)
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB', // border-gray-300
                            borderWidth: '1px',
                            transition: 'all 0.2s ease-in-out',
                        },
                        // Hover state
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.35)' : '#9CA3AF', // border-gray-400
                        },
                        // Focus state
                        '&.Mui-focused': {
                            boxShadow: isDark
                                ? '0 0 0 2px rgba(156,241,240,0.25)'
                                : '0 0 0 2px rgba(0, 106, 106, 0.15)', // ring-2 ring-[#006A6A]/15
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#006A6A',
                            borderWidth: '1px', // Keep border-width 1px to prevent layout shift
                        },
                        // Error state
                        '&.Mui-error': {
                            boxShadow: '0 0 0 2px rgba(248, 113, 113, 0.15)', // ring-2 ring-red-400/15
                        },
                        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#F87171', // border-red-400
                            borderWidth: '1px',
                        },
                        // Success state (custom class used on blur)
                        '&.Mui-success .MuiOutlinedInput-notchedOutline, .Mui-success & .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#34D399', // border-emerald-400
                            borderWidth: '1px',
                        },
                    },
                    input: {
                        padding: '0 16px', // px-4 (16px) horizontal padding
                        height: '100%',
                        fontSize: '14px', // text-sm
                        fontWeight: 400, // font-normal
                        color: isDark ? '#E0F2F1' : '#111827', // text-gray-900
                        '&::placeholder': {
                            color: '#9CA3AF', // text-gray-400
                            opacity: 1,
                        },
                        // Fix for textareas inside multiline textfields to avoid height constraints
                        '&.MuiInputBase-inputMultiline, textarea&': {
                            height: 'auto',
                            padding: '12px 16px',
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        fontFamily: "'DM Sans', sans-serif",
                        '&.Mui-focused': { color: '#006A6A' },
                    },
                },
            },

            /* ── Card — Google & MD3 style elevation ── */
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,           // MD3 shape.lg
                        boxShadow: isDark 
                            ? '0 1px 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.5)' 
                            : '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                        border: 'none',
                        backgroundColor: isDark
                            ? 'rgba(24, 31, 31, 0.95)'
                            : '#FFFFFF',
                        backgroundImage: 'none',
                        backdropFilter: 'blur(20px)',
                    },
                },
            },

            /* ── Alert ── */
            MuiAlert: {
                styleOverrides: {
                    root: {
                        fontFamily: "'DM Sans', sans-serif",
                        borderRadius: 12,
                        fontSize: '14px',
                    },
                },
            },

            /* ── Checkbox ── */
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        color: isDark ? 'rgba(156,241,240,0.4)' : 'rgba(0,106,106,0.4)',
                        '&.Mui-checked': { color: '#006A6A' },
                    },
                },
            },

            /* ── FormHelperText ── */
            MuiFormHelperText: {
                styleOverrides: {
                    root: { fontFamily: "'DM Sans', sans-serif" },
                },
            },

            /* ── LinearProgress ── */
            MuiLinearProgress: {
                styleOverrides: {
                    root: { borderRadius: 4, height: 4 },
                    bar: { borderRadius: 4 },
                },
            },

            /* ── Dialog ── */
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 28,           // MD3 shape.xl
                        padding: '16px',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: isDark ? 'rgba(24,31,31,0.95)' : 'rgba(255,255,255,0.95)',
                    },
                },
            },
        },
    });
};

// Default light theme export
const theme = getThemeConfig('light');
export default theme;
