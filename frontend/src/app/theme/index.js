import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { spacing, shape, breakpoints } from './spacing';

/**
 * Global Theme Aggregator
 * Assembles tokens and applies strict M3 Component overrides.
 */
const theme = createTheme({
    palette,
    typography,
    spacing,
    shape,
    breakpoints,
    components: {
        // Component overrides to enforce UI Standards
        MuiButton: {
            defaultProps: {
                disableElevation: true, // Flat M3 aesthetic
            },
            styleOverrides: {
                root: {
                    borderRadius: 20, // Pill shaped buttons
                    minHeight: '40px', // Touch-target accessibility standard
                    padding: '10px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: 'none', // Rely on surface contrast
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: palette.background.default,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: shape.borderRadius,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                fullWidth: true,
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 24, // High elevation gets higher border radius
                    padding: '16px',
                },
            },
        },
    },
});

export default theme;
