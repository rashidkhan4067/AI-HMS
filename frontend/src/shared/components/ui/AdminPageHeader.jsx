import React from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { FONTS } from '../../theme.constants';

/**
 * Standard Header for Admin Pages
 * Replaces the repeated title + subtitle + refresh button block.
 * 
 * @param {string} title
 * @param {string} subtitle
 * @param {Function} onRefresh - Handler for refresh button
 * @param {boolean} loading - Controls refresh button loading state
 * @param {React.ReactNode} actions - Additional buttons next to refresh
 */
export const AdminPageHeader = ({ title, subtitle, onRefresh, loading, actions }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        {loading && !title ? (
          <Skeleton width={200} height={40} />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.75,
              fontFamily: FONTS.HEADING,
              fontSize: { xs: '1.65rem', sm: '2rem' },
            }}
          >
            {title}
          </Typography>
        )}
        {loading && !subtitle ? (
          <Skeleton width={300} height={20} />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: FONTS.BODY }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {actions}
        {onRefresh && (
          <Button
            size="small"
            variant="outlined"
            startIcon={
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            }
            onClick={onRefresh}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '100px',
              borderColor: 'divider',
              color: 'text.primary',
              fontSize: '13px',
              px: 2,
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
