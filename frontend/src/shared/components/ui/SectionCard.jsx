import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import { FONTS, iconContainerSx, RADII } from '../../theme.constants';

/**
 * Reusable Section Card
 * Standard card with an icon header and content area.
 * Extracted from dashboard, IPD, and revenue pages.
 * 
 * @param {string} title - Section title
 * @param {string} subtitle - Section subtitle
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} iconColor - Icon color hex
 * @param {string} iconBg - Icon background color hex/rgba
 * @param {React.ReactNode} actions - Optional actions (buttons) in header
 * @param {React.ReactNode} children - Card content
 */
export const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  actions,
  children,
}) => {
  return (
    <Card sx={{ 
      borderRadius: '8px', 
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
      boxShadow: 'none',
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {Icon && (
            <Box
              sx={{
                ...iconContainerSx(iconBg, iconColor),
                width: 40,
                height: 40,
                justifyContent: 'center',
              }}
            >
              <Icon size={20} strokeWidth={2.5} />
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '1.1rem' }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: FONTS.BODY }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions && <Box>{actions}</Box>}
      </Box>
      <Divider />
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        {children}
      </CardContent>
    </Card>
  );
};
