/**
 * Al Shifaa HMS — MD3 Clinical Color Palette
 * Primary: Clinical Teal #006A6A | Strictly WCAG 2.1 AA (4.5:1 contrast)
 */
export const getPalette = (mode) => {
    if (mode === 'dark') {
        return {
            mode: 'dark',
            primary: {
                main: '#9CF1F0',          // On-primary-container in dark (readable teal)
                light: '#004F4F',          // Primary container dark
                dark: '#CBF5F4',
                contrastText: '#002020',
            },
            secondary: {
                main: '#B0CCCC',           // Secondary on dark
                light: '#213535',
                dark: '#CCE8E7',
                contrastText: '#162020',
            },
            error: {
                main: '#FFB4AB',
                light: '#680003',
                contrastText: '#680003',
            },
            warning: {
                main: '#FDB700',
                contrastText: '#261A00',
            },
            success: {
                main: '#68DDA1',
                contrastText: '#003919',
            },
            background: {
                default: '#0F1515',        // Deep clinical dark surface
                paper: '#181F1F',          // Elevated card
            },
            text: {
                primary: '#E0F2F1',
                secondary: '#B0CCCC',
                disabled: '#6F7979',
            },
            divider: 'rgba(156, 241, 240, 0.08)',
        };
    }

    // Light Mode — MD3 Clinical Teal
    return {
        mode: 'light',
        primary: {
            main: '#006A6A',              // Clinical teal — MD3 primary
            light: '#9CF1F0',             // Primary container
            dark: '#004F4F',              // On primary container
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#4A6363',              // Secondary teal-grey
            light: '#CCE8E7',             // Secondary container
            dark: '#293535',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#BA1A1A',
            light: '#FFDAD6',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#7D5700',
            light: '#FFDEA8',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#1D6B35',
            light: '#B8F0CF',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F4FBFB',           // MD3 surface — light clinical white-teal
            paper: '#FFFFFF',
        },
        text: {
            primary: '#161D1D',           // On-surface
            secondary: '#3F4F4F',
            disabled: '#6F7979',          // Outline color
        },
        divider: 'rgba(0, 106, 106, 0.12)',
    };
};
