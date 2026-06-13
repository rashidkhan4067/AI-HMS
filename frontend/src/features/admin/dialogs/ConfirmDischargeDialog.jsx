import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

export const ConfirmDischargeDialog = ({ open, onClose, onConfirm, bedNumber, patientName, submitting }) => {
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
                        maxWidth: 400,
                        width: '100%',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, mt: 1 }}>
                <Box 
                    sx={{ 
                        p: 1.75, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(2, 136, 209, 0.08)', 
                        color: '#0288D1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
                    <ShieldAlert size={28} />
                </Box>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 600, 
                        fontFamily: "'Outfit', sans-serif", 
                        fontSize: '20px',
                        textAlign: 'center',
                        color: 'text.primary'
                    }}
                >
                    Discharge Patient?
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
                    Are you sure you want to discharge <strong style={{ color: 'var(--mui-palette-text-primary)' }}>{patientName || 'the patient'}</strong> from <strong>Bed {bedNumber}</strong>?
                </DialogContentText>
                <Box 
                    sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(2, 136, 209, 0.04)', 
                        border: '1px solid rgba(2, 136, 209, 0.12)', 
                        borderRadius: '16px', 
                        mb: 1 
                    }}
                >
                    <Typography 
                        variant="caption" 
                        color="#0288D1" 
                        sx={{ 
                            fontWeight: 600, 
                            display: 'block', 
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.4,
                            textAlign: 'center'
                        }}
                    >
                        This will release the bed assignment and mark the bed status under "Cleaning" rotation.
                    </Typography>
                </Box>
            </DialogContent>
            
            <DialogActions 
                sx={{ 
                    p: 0, 
                    pt: 2, 
                    gap: 1.5, 
                    justifyContent: 'center',
                    width: '100%'
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
                        px: 3,
                        py: 0.8
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    disabled={submitting}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        bgcolor: '#0288D1',
                        color: '#fff',
                        px: 3,
                        py: 0.8,
                        '&:hover': {
                            bgcolor: '#0277bd'
                        }
                    }}
                >
                    {submitting ? 'Discharging...' : 'Confirm Discharge'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDischargeDialog;
