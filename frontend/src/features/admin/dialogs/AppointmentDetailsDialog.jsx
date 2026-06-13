import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Grid, Typography, Box, Chip, useTheme 
} from '@mui/material';
import { FileText, Lock, ShieldAlert } from 'lucide-react';

export const AppointmentDetailsDialog = ({ open, onClose, selectedAppt, formatPKR }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '500px', width: '100%' } }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={20} style={{ color: theme.palette.primary.main }} />
                Appointment Details #{selectedAppt?.id}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                        Patient Information
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Name:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedAppt?.patient_name || 'Walk-In'}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">MRN:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedAppt?.patient_mrn || 'N/A'}</Typography></Grid>
                    </Grid>
                </Box>

                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                        Scheduling & Billing
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Doctor:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2" sx={{ fontWeight: 600 }}>Dr. {selectedAppt?.doctor_name}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Specialty:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{selectedAppt?.doctor_specialization || 'General Practice'}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Date / Slot:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2">{selectedAppt?.date} ({selectedAppt?.start_time?.substring(0, 5)} - {selectedAppt?.end_time?.substring(0, 5)})</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Consult Fee:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedAppt ? formatPKR(selectedAppt.doctor_consultation_fee || 0) : 'PKR 0'}</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body2" color="text.secondary">Status:</Typography></Grid>
                        <Grid item xs={8}>
                            <Chip 
                                label={selectedAppt?.status} 
                                size="small" 
                                color={selectedAppt?.status === 'COMPLETED' ? 'success' : selectedAppt?.status === 'CONFIRMED' ? 'primary' : selectedAppt?.status === 'CANCELLED' ? 'error' : 'warning'}
                                sx={{ fontWeight: 700 }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary', mb: 1 }}>
                        <Lock size={14} style={{ color: theme.palette.text.secondary }} />
                        Clinical Reason for Visit
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 600 }}>
                        {selectedAppt?.reason || '[REDACTED]'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Reason field is auto-redacted by the server's serialized output for admin roles.
                    </Typography>
                </Box>

                <Box sx={{ bgcolor: 'rgba(186, 26, 26, 0.03)', p: 2, borderRadius: '12px', border: '1px dashed', borderColor: 'error.light' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', mb: 1 }}>
                        <ShieldAlert size={14} />
                        Vitals Station Data (Redacted)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Blood pressure, heart rate, oxygen levels, temperature, height, and weight are entirely hidden from administrators under privacy rules.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button 
                    variant="contained"
                    onClick={onClose}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                >
                    Close Details
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AppointmentDetailsDialog;
