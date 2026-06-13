import React from 'react';
import { Skeleton, Alert } from '@mui/material';
import { FONTS, RADII } from '../../theme.constants';

/**
 * Reusable wrapper for async data loading/error states.
 * Replaces `{loading ? <Skeleton /> : error ? <Alert /> : children}`
 * 
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error message
 * @param {React.ReactNode} children - Content to render when ready
 * @param {React.ReactNode} skeleton - Optional custom skeleton (defaults to rectangular block)
 */
export const AsyncWrapper = ({ loading, error, children, skeleton }) => {
  if (loading) {
    return skeleton || (
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={250} 
        sx={{ borderRadius: RADII.CARD }} 
      />
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ borderRadius: RADII.MEDIUM, fontFamily: FONTS.BODY }}
      >
        {error}
      </Alert>
    );
  }

  return <>{children}</>;
};
