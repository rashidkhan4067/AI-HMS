import React from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { FONTS } from '../../theme.constants';

/**
 * PageHeader — Consistent page title + optional subtitle block.
 *
 * @param {string}    title       - Main page title (h4 by default)
 * @param {string}    subtitle    - Secondary description text below the title
 * @param {string}    titleColor  - MUI color for the title (default: 'text.primary')
 * @param {object}    sx          - Additional MUI sx styles on the wrapper Box
 * @param {Function}  onRefresh   - Handler for refresh button (optional)
 * @param {boolean}   loading     - Controls refresh button loading state (optional)
 * @param {ReactNode} actions     - Additional buttons next to refresh (optional)
 */
export const PageHeader = ({
    title,
    subtitle,
    titleColor = 'text.primary',
    sx = {},
    onRefresh,
    loading,
    actions
}) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 }, 
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            ...sx 
        }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {loading && !title ? (
                    <Skeleton width={200} height={40} />
                ) : (
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: titleColor,
                            mb: subtitle ? 0.5 : 0,
                            fontFamily: FONTS?.HEADING || '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                            lineHeight: 1.2,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {title}
                    </Typography>
                )}
                {loading && !subtitle ? (
                    <Skeleton width={300} height={20} />
                ) : subtitle ? (
                    <Typography 
                        variant="body2" 
                        sx={{
                            color: 'text.secondary',
                            fontFamily: FONTS?.BODY || '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                            fontSize: { xs: '0.85rem', sm: '0.875rem' },
                            lineHeight: 1.4,
                            maxWidth: '800px'
                        }}
                    >
                        {subtitle}
                    </Typography>
                ) : null}
            </Box>

            {(actions || onRefresh) && (
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    alignItems: 'center',
                    flexShrink: 0,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                }}>
                    {actions}
                    {onRefresh && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                            }
                            onClick={onRefresh}
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '6px',
                                borderColor: 'divider',
                                color: 'text.primary',
                                fontSize: '13px',
                                px: 2,
                                py: 0.75,
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                boxShadow: 'none',
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
            )}
        </Box>
    );
};
