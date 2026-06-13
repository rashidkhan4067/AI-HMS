import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';

export const CancelAppointmentDialog = ({
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
                Cancel Appointment Booking?
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {actionSuccess && <Alert severity="success" sx={{ borderRadius: '12px' }}>{actionSuccess}</Alert>}
                {actionError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{actionError}</Alert>}

                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    Are you sure you want to cancel the appointment for <strong>{actionAppt?.patient_name}</strong> with <strong>Dr. {actionAppt?.doctor_name}</strong> on <strong>{actionAppt?.date}</strong>?
                </Typography>
                <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                    This will free up the doctor availability slot and notify the patient.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                    onClick={onClose}
                    disabled={submitting}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Keep Booking
                </Button>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={onConfirm}
                    disabled={submitting}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                >
                    {submitting ? 'Cancelling...' : 'Cancel Appointment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelAppointmentDialog;
