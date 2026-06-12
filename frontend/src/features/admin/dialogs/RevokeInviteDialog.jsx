import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

export const RevokeInviteDialog = ({ open, onClose, email, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { 
                        borderRadius: { xs: '20px', sm: '28px' }, 
                        p: { xs: 2.5, sm: 3 },
                        m: { xs: 1.5, sm: 2 },
                        maxWidth: 440,
                        width: '100%',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            {/* Header Icon container */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, mt: 1 }}>
                <Box 
                    sx={{ 
                        p: 1.75, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(219, 68, 85, 0.08)', 
                        color: '#DB4437',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
                    <AlertTriangle size={28} />
                </Box>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 600, 
                        fontFamily: "'Outfit', sans-serif", 
                        fontSize: '22px',
                        textAlign: 'center',
                        color: 'text.primary'
                    }}
                >
                    Revoke Invitation?
                </Typography>
            </Box>

            <DialogContent sx={{ px: 1, py: 0 }}>
                <DialogContentText 
                    sx={{ 
                        color: 'text.secondary', 
                        mb: 2, 
                        fontFamily: "'DM Sans', sans-serif", 
                        textAlign: 'center',
                        fontSize: '14.5px',
                        lineHeight: 1.6
                    }}
                >
                    Are you sure you want to revoke the active onboarding token issued to <strong style={{ color: 'var(--mui-palette-text-primary)' }}>{email}</strong>?
                </DialogContentText>
                
                <Box 
                    sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(219, 68, 85, 0.04)', 
                        border: '1px solid rgba(219, 68, 85, 0.12)', 
                        borderRadius: '16px', 
                        mb: 1 
                    }}
                >
                    <Typography 
                        variant="caption" 
                        color="#DB4437" 
                        sx={{ 
                            fontWeight: 600, 
                            display: 'block', 
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.4,
                            textAlign: 'center'
                        }}
                    >
                        ⚠️ Warning: The recipient will immediately be blocked from registering on the platform. Any unused onboarding link will be rendered invalid.
                    </Typography>
                </Box>
            </DialogContent>
            
            <DialogActions 
                sx={{ 
                    p: 0, 
                    pt: 3, 
                    gap: 1.5, 
                    flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                    justifyContent: 'center',
                    width: '100%',
                    '& button': {
                        width: { xs: '100%', sm: 'auto' }
                    }
                }}
            >
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        borderColor: 'divider', 
                        color: 'text.primary',
                        px: 3.5,
                        py: 1.1,
                        fontSize: '14px',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'text.secondary'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        boxShadow: 'none',
                        bgcolor: '#DB4437',
                        color: '#fff',
                        px: 3.5,
                        py: 1.1,
                        fontSize: '14px',
                        '&:hover': {
                            bgcolor: '#c53929',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Revoke Invitation
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RevokeInviteDialog;
