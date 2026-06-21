import React from 'react';
import { Card, CardContent, Box, Typography, Divider, Skeleton, useTheme, Chip } from '@mui/material';
import { cardHoverSx, FONTS } from '../../theme.constants';

/**
 * Reusable Unified Dashboard Card
 * Modelled on Google Cloud Console / Google Analytics dashboard density:
 * - 8px (rounded-lg) border-radius system-wide.
 * - Thin border, no drop shadow.
 * - 16px (p-4) padding on mobile, 24px (p-6 / p: 3) on desktop.
 * - w-9 h-9 (36px) fixed size icon chips.
 * - Locked typography scale:
 *   - label: text-xs uppercase muted (fontSize: '11px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px')
 *   - primary value: text-2xl bold (fontSize: '24px', fontWeight: 800, color: 'text.primary')
 *   - supporting text: text-sm (fontSize: '13px', color: 'text.secondary')
 */
export const DashboardCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  title, // acts as the label/title
  subtitle, // short supporting text under title
  value, // primary value/number
  supportingText, // short supporting text under value
  action, // custom action node, e.g. a Chip
  actionText, // action button/chip text
  onActionClick, // action click handler
  loading = false,
  minHeight,
  children,
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Standard icon chip style: w-9 h-9 (36px x 36px) and same border radius (8px)
  const defaultBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB';
  const defaultColor = isDark ? '#9CA3AF' : '#374151';
  const bg = iconBg || defaultBg;
  const fg = iconColor || defaultColor;

  const shouldBeClickable = onActionClick && !children;

  return (
    <Card
      onClick={shouldBeClickable ? onActionClick : undefined}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'divider' : '#E5E7EB',
        boxShadow: 'none',
        height: '100%',
        minHeight: minHeight,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? 'background.paper' : '#FFFFFF',
        cursor: shouldBeClickable ? 'pointer' : 'default',
        ...(shouldBeClickable ? cardHoverSx(isDark) : {}),
        ...sx,
      }}
    >
      {/* If it acts as a SectionCard (i.e. has children) */}
      {children ? (
        <>
          <Box
            sx={{
              p: 2, // p-4 on mobile (16px)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: '1 1 auto' }}>
              {Icon && (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    bgcolor: bg,
                    color: fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </Box>
              )}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontFamily: FONTS.HEADING,
                    fontSize: '14px',
                    color: 'text.primary',
                    lineHeight: 1.2,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: 'text.secondary',
                      fontFamily: FONTS.BODY,
                      lineHeight: 1.2,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      mt: 0.25,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {(action || onActionClick) && (
              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {action || (
                  <Chip
                    label={actionText || 'View'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick();
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderColor: 'divider',
                      color: 'text.secondary',
                      height: 22,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
          <Divider />
          <CardContent
            sx={{
              p: 2, // p-4 mobile (16px)
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              '&:last-child': { pb: 2 },
            }}
          >
            {children}
          </CardContent>
        </>
      ) : (
        /* If it acts as a StatCard (i.e. simple stat card without children) */
        <Box
          sx={{
            p: 2, // p-4 mobile (16px)
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: '100%',
            position: 'relative',
          }}
        >
          {Icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: bg,
                color: fg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} strokeWidth={2.5} />
            </Box>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: 'text.secondary',
                mb: 0.25,
                fontWeight: 700,
                fontFamily: FONTS.BODY,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={28} />
            ) : (
              <Typography
                sx={{
                  fontWeight: 800,
                  fontFamily: FONTS.HEADING,
                  color: 'text.primary',
                  fontSize: '24px',
                  lineHeight: 1.1,
                }}
              >
                {value}
              </Typography>
            )}
            {(supportingText || loading) && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  mt: 0.25,
                  display: 'block',
                  fontFamily: FONTS.BODY,
                  fontSize: '13px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? <Skeleton width={100} /> : supportingText}
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
                ml: 'auto',
                alignSelf: 'flex-start',
                mt: -0.5,
                fontSize: '10px',
                fontWeight: 600,
                borderColor: 'divider',
                color: 'text.secondary',
                height: 22,
                flexShrink: 0,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            />
          )}
        </Box>
      )}
    </Card>
  );
};

export default DashboardCard;
