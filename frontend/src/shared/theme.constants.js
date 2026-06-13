/**
 * Al Shifaa HMS — Theme Design Tokens
 * Centralized colors, font families, and border radii.
 * Import these instead of hardcoding values in components.
 */

// ─── Brand / Semantic Colors ───────────────────────────────────
export const COLORS = {
  PRIMARY: '#006A6A',
  PRIMARY_DARK: '#005858',
  ACCENT: '#4DB6AC',
  DANGER: '#BA1A1A',
  WARNING: '#FF9800',
  SUCCESS: '#16A34A',
  SUCCESS_DARK: '#1D6B35',
  INFO: '#0D6EFD',
  LAB_TECH: '#0288D1',
  ADMIN_PURPLE: '#9C27B0',
  TEAL_GREY: '#4A6363',
  AMBER: '#7D5700',
};

/** Background tints for icon containers */
export const COLORS_BG = {
  PRIMARY: 'rgba(0, 106, 106, 0.05)',
  PRIMARY_DARK: 'rgba(0, 88, 88, 0.05)',
  ACCENT: 'rgba(77, 182, 172, 0.08)',
  DANGER: 'rgba(186, 26, 26, 0.05)',
  WARNING: 'rgba(255, 152, 0, 0.03)',
  SUCCESS: 'rgba(22, 163, 74, 0.05)',
  INFO: 'rgba(13, 110, 253, 0.05)',
};

// ─── Font Families ─────────────────────────────────────────────
export const FONTS = {
  HEADING: "'Outfit', sans-serif",
  BODY: "'DM Sans', sans-serif",
};

// ─── Border Radii ──────────────────────────────────────────────
export const RADII = {
  CARD: '16px',
  CARD_LG: '24px',
  CHIP: '6px',
  PILL: '100px',
  DIALOG: '24px',
  INPUT: '100px',
  SMALL: '8px',
  MEDIUM: '12px',
};

// ─── Reusable sx Fragments ─────────────────────────────────────
// Common sx patterns used across multiple components

/** Standard icon container: colored bg + icon */
export const iconContainerSx = (bgColor, iconColor) => ({
  p: 1,
  borderRadius: RADII.SMALL,
  bgcolor: bgColor,
  color: iconColor,
  display: 'flex',
  alignItems: 'center',
});

/** Standard card hover effect */
export const cardHoverSx = (isDark = false) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isDark
      ? '0 4px 20px rgba(0,0,0,0.5)'
      : '0 4px 20px rgba(60,64,67,0.15)',
  },
});

/** Standard pill button sx */
export const pillButtonSx = {
  borderRadius: RADII.PILL,
  textTransform: 'none',
  fontWeight: 600,
  borderColor: 'divider',
  color: 'text.primary',
  fontSize: '12.5px',
  '&:hover': {
    bgcolor: 'action.hover',
    borderColor: 'divider',
  },
};

/** Heading typography sx */
export const headingSx = (fontSize = '2rem') => ({
  fontWeight: 700,
  color: 'text.primary',
  fontFamily: FONTS.HEADING,
  fontSize,
});

/** Body/caption typography sx */
export const bodySx = {
  color: 'text.secondary',
  fontFamily: FONTS.BODY,
};

/** Metric card container sx */
export const metricBoxSx = {
  p: 2,
  borderRadius: RADII.CARD,
  bgcolor: 'action.hover',
  border: '1px solid',
  borderColor: 'divider',
  height: '100%',
};
