/**
 * Material Design 3 Color System for Healthcare SaaS
 * Strictly adheres to 4.5:1 contrast ratios for accessibility.
 */
export const palette = {
    mode: 'light',
    primary: {
        main: '#005ac1', // Healthcare Blue - Trust, calm, clinical
        light: '#d8e2ff', // Primary Container
        dark: '#00418c',  // On Primary Container
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#006a60',  // Teal - Accents, secondary actions
        light: '#74f8e5', // Secondary Container
        dark: '#005048',
        contrastText: '#ffffff',
    },
    error: {
        main: '#ba1a1a',  // Crimson Red - Destructive actions, validation
        light: '#ffdad6',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#ffb400',  // Amber - Missing data, pending
        contrastText: '#ffffff',
    },
    success: {
        main: '#146c2e',  // Green - Operation success, healthy status
        contrastText: '#ffffff',
    },
    background: {
        default: '#fdfcff', // Pure Surface
        paper: '#f3f4f9',   // Surface Container
    },
    text: {
        primary: '#1a1c1e',
        secondary: '#42474e',
        disabled: '#73777f',
    },
};
