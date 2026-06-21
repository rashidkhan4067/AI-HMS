import React from 'react';
import { Card, Box, Typography, Skeleton, useTheme, Chip } from '@mui/material';
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
  * @param {string} actionText - Optional action link text
  * @param {Function} onActionClick - Optional action link click handler
  */
export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  iconBg,
  iconColor,
  loading = false,
  onClick,
  actionText,
  onActionClick,
  chipLabel,
  chipColor = 'default',
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bg = iconBg || (isDark ? `${color}20` : `${color}15`);
  const fg = iconColor || color;

  const hasAction = onClick || onActionClick;
  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onActionClick) {
      onActionClick(e);
    }
  };

  return (
    <Card
      onClick={hasAction ? handleCardClick : undefined}
      sx={{
        p: { xs: 1.5, sm: 2 }, // p-3 (12px) on mobile, p-4 (16px) on desktop
        borderRadius: '8px',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1.5, sm: 2 },
        height: '100%',
        cursor: hasAction ? 'pointer' : 'default',
        ...(hasAction ? cardHoverSx(isDark) : {}),
        ...sx,
      }}
    >
      {Icon && (
        <Box
          sx={{
            ...iconContainerSx(bg, fg),
            width: 36, // fixed 36x36 (w-9 h-9)
            height: 36,
            borderRadius: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            p: 0, // override padding to guarantee exact size
          }}
        >
          <Icon size={18} strokeWidth={2.5} />
        </Box>
      )}
      <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontFamily: FONTS.BODY,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {chipLabel && (
            <Chip
              label={chipLabel}
              size="small"
              color={chipColor}
              sx={{
                fontSize: '9px',
                height: 16,
                fontWeight: 600,
                borderRadius: '4px',
              }}
            />
          )}
        </Box>
        {loading ? (
          <Skeleton width={80} height={24} sx={{ my: 0.5 }} />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: FONTS.HEADING,
              color: 'text.primary',
              fontSize: { xs: '20px', sm: '24px' }, // text-2xl (20px) on mobile, 24px on desktop
              lineHeight: 1.1,
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
              mt: 0.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: FONTS.BODY,
              fontSize: { xs: '11.5px', sm: '13px' }, // text-xs (11.5px) on mobile
              lineHeight: 1.25,
            }}
          >
            {loading ? <Skeleton width={120} /> : description}
          </Typography>
        )}
      </Box>
      {onActionClick && !loading && (
        <Chip 
          label={actionText || 'View list'} 
          onClick={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
          variant="outlined"
          size="small"
          sx={{ 
            cursor: 'pointer', 
            ml: { xs: 0, sm: 'auto' }, 
            alignSelf: { xs: 'flex-end', sm: 'flex-start' }, 
            mt: { xs: 0.5, sm: -0.5 },
            fontSize: '10px',
            fontWeight: 600,
            borderColor: 'divider',
            color: 'text.secondary',
            height: 22,
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        />
      )}
    </Card>
  );
};
