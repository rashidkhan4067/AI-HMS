/**
 * Material Design 3 Spacing & Shape Tokens
 * Adheres to a strict 4px grid and standardized border radii.
 */

// A spacing factor of 4 means theme.spacing(2) = 8px
export const spacing = 4;

export const shape = {
    // 8px is the baseline M3 border radius for small components (Inputs, Menus)
    borderRadius: 8, 
};

// Breakpoints for responsive design
export const breakpoints = {
    values: {
        xs: 0,    // Mobile
        sm: 600,  // Tablet
        md: 1024, // Desktop
        lg: 1440, // Large Desktop
        xl: 1920,
    },
};
