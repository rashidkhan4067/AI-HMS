import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

export const DeleteAppointmentDialog = ({
    open,
    onClose,
    actionAppt,
    onConfirm,
    submitting,
    actionSuccess,
    actionError
}) => {
    return (
        <Dialog
            open={open}
            onClose={() => !submitting && onClose()}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '400px', width: '100%' } }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                Permanently Delete Record?
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {actionSuccess && <Alert severity="success" sx={{ borderRadius: '12px' }}>{actionSuccess}</Alert>}
                {actionError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{actionError}</Alert>}

                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    Are you sure you want to permanently delete this appointment record? This action is irreversible and will purge it from audit schedules.
                </Typography>
                <Typography variant="caption" color="error" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AlertTriangle size={14} />
                    Warning: This will delete corresponding slots history.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                    onClick={onClose}
                    disabled={submitting}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={onConfirm}
                    disabled={submitting}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                >
                    {submitting ? 'Deleting...' : 'Delete Record'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAppointmentDialog;
