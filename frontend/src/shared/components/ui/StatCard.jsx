import React from 'react';
import { Card, Box, Typography, Skeleton, useTheme } from '@mui/material';
import { cardHoverSx, FONTS, iconContainerSx, RADII } from '../../theme.constants';

/**
 * Reusable KPI/Stat Card
 * Extracted from dashboard, revenue, and IPD pages.
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main stat value
 * @param {string} description - Subtitle/description
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} color - Primary color hex (used for icon text/bg)
 * @param {boolean} loading - Loading state
 * @param {Function} onClick - Optional click handler
 */
export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  loading = false,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: RADII.CARD,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick ? cardHoverSx(isDark) : {}),
      }}
    >
      <Box
        sx={{
          ...iconContainerSx(
            isDark ? `${color}20` : `${color}15`, // Use hex with opacity
            color
          ),
          width: 54,
          height: 54,
          borderRadius: RADII.MEDIUM,
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={26} strokeWidth={2.5} />}
      </Box>
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 0.5,
            fontWeight: 600,
            fontFamily: FONTS.BODY,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={32} />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: FONTS.HEADING,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        )}
        {(description || loading) && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              display: 'block',
              fontFamily: FONTS.BODY,
            }}
          >
            {loading ? <Skeleton width={120} /> : description}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
