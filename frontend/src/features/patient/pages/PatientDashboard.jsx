import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, 
    CircularProgress, Alert, Snackbar, Paper, Dialog, DialogTitle, 
    DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Calendar, Trash2, Plus, Clock, ShieldAlert, Award, FileText } from 'lucide-react';
import { PageHeader } from '../../../shared/components/ui';
import { schedulingApi } from '../../scheduling/services/schedulingApi';
import { BookAppointmentDialog } from '../../scheduling/components/BookAppointmentDialog';

/**
 * PatientDashboard — Personal health portal consultation logs and booking screen.
 * Displays KPI cards, lists upcoming and historical appointments, and allows patients
 * to cancel slot reservations or book new ones via the wizard dialog.
 */
export const PatientDashboard = () => {
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');
    
    // Booking Dialog trigger
    const [bookingOpen, setBookingOpen] = useState(false);

    // Cancel Dialog trigger
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const loadAppointments = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await schedulingApi.getAppointments();
            setAppointments(data);
        } catch {
            setErrorMsg('Failed to load your consultations list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (active) loadAppointments();
        });
        return () => {
            active = false;
        };
    }, []);

    const handleCancelClick = (appt) => {
        setCancelTarget(appt);
    };

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            await schedulingApi.updateAppointmentStatus(cancelTarget.id, 'CANCELLED');
            setSuccessMsg('Your appointment was successfully cancelled.');
            loadAppointments();
        } catch (err) {
            setErrorMsg(err.response?.data?.detail || 'Failed to cancel appointment.');
        } finally {
            setCancelling(false);
            setCancelTarget(null);
        }
    };

    // Calculate metrics
    const totalConsults = appointments.length;
    const pendingSlots = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
    const completedAppts = appointments.filter(a => a.status === 'COMPLETED').length;

    // Status chip mapping
    const getStatusChip = (status) => {
        const config = {
            PENDING: { label: 'Pending', color: 'info', bg: 'rgba(13, 110, 253, 0.06)', border: 'rgba(13, 110, 253, 0.15)', text: '#0D6EFD' },
            CONFIRMED: { label: 'Confirmed', color: 'primary', bg: 'rgba(0, 106, 106, 0.06)', border: 'rgba(0, 106, 106, 0.15)', text: '#006A6A' },
            CANCELLED: { label: 'Cancelled', color: 'error', bg: 'rgba(186, 26, 26, 0.06)', border: 'rgba(186, 26, 26, 0.15)', text: '#BA1A1A' },
            COMPLETED: { label: 'Completed', color: 'success', bg: 'rgba(22, 163, 74, 0.06)', border: 'rgba(22, 163, 74, 0.15)', text: '#16A34A' }
        };

        const cfg = config[status] || { label: status, color: 'default', bg: 'rgba(107, 114, 128, 0.06)', border: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' };

        return (
            <Chip 
                label={cfg.label}
                size="small"
                sx={{
                    bgcolor: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.text,
                    fontWeight: 600,
                    fontSize: '11.5px',
                    height: '22px'
                }}
            />
        );
    };

    // Format time display
    const formatTimeLabel = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <PageHeader 
                    title="Health Portal Workspace" 
                    subtitle="Manage your scheduled consultations, reviews, and clinical records."
                />
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setBookingOpen(true)}
                    sx={{
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                        boxShadow: '0 4px 12px rgba(0, 106, 106, 0.2)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                        }
                    }}
                >
                    Book Consultation
                </Button>
            </Box>

            {/* KPI Metric Grid */}
            <Grid container spacing={3} sx={{ mt: 0.5, mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(0, 106, 106, 0.05)', display: 'flex', alignItems: 'center', justifyContext: 'center', color: 'primary.main', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={20} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Total Consultations
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                    {totalConsults}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(13, 110, 253, 0.05)', display: 'flex', alignItems: 'center', justifyContext: 'center', color: 'info.main', justifyContent: 'center', flexShrink: 0 }}>
                                <Clock size={20} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Upcoming Reservations
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                    {pendingSlots}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(22, 163, 74, 0.05)', display: 'flex', alignItems: 'center', justifyContext: 'center', color: 'success.main', justifyContent: 'center', flexShrink: 0 }}>
                                <Award size={20} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Completed Visits
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                    {completedAppts}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* List / Table of Consultations */}
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                        Consultation Directory Log
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                        Review your booked clinician slots, status, and cancel configurations below.
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={35} />
                    </Box>
                ) : errorMsg ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="error" sx={{ borderRadius: '12px' }}>{errorMsg}</Alert>
                    </Box>
                ) : appointments.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, color: 'text.disabled' }}>
                        <Calendar size={50} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px', color: 'text.primary' }}>
                            No Consultations Scheduled
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, mb: 3 }}>
                            Book a secure consultation slot with our medical specialists.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Plus size={16} />}
                            onClick={() => setBookingOpen(true)}
                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3 }}
                        >
                            Book First Slot
                        </Button>
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Medical Specialist</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Specialization</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Appointment Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Time Interval</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Consult Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.map((appt) => {
                                    const canCancel = appt.status === 'PENDING' || appt.status === 'CONFIRMED';
                                    return (
                                        <TableRow key={appt.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Dr. {appt.doctor_name}</TableCell>
                                            <TableCell>
                                                <Chip label={appt.doctor_specialization} size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: '11px' }} />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(appt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                                                {formatTimeLabel(appt.start_time)} - {formatTimeLabel(appt.end_time)}
                                            </TableCell>
                                            <TableCell>{getStatusChip(appt.status)}</TableCell>
                                            <TableCell align="right">
                                                {canCancel ? (
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => handleCancelClick(appt)}
                                                        sx={{
                                                            color: '#BA1A1A',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(186, 26, 26, 0.05)'
                                                            }
                                                        }}
                                                        title="Cancel Consultation"
                                                    >
                                                        <Trash2 size={17} />
                                                    </IconButton>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                        No Actions
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            {/* WIZARD BOOKING DIALOG */}
            <BookAppointmentDialog 
                open={bookingOpen} 
                onClose={() => setBookingOpen(false)}
                onSuccess={() => {
                    setSuccessMsg('Consultation slot successfully reserved!');
                    loadAppointments();
                }}
            />

            {/* CANCELLATION CONFIRMATION DIALOG */}
            <Dialog
                open={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <ShieldAlert style={{ color: '#BA1A1A' }} size={22} />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Cancel Appointment Slot?
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                        Are you sure you want to cancel your consultation slot with <strong>Dr. {cancelTarget?.doctor_name}</strong> on <strong>{cancelTarget?.date}</strong>? This action will release the slot back into the hospital directory.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={() => setCancelTarget(null)}
                        disabled={cancelling}
                        sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderRadius: '100px' }}
                    >
                        Keep Booking
                    </Button>
                    <Button 
                        onClick={handleConfirmCancel}
                        disabled={cancelling}
                        variant="contained"
                        color="error"
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            borderRadius: '100px',
                            bgcolor: '#BA1A1A',
                            '&:hover': { bgcolor: '#93000A' }
                        }}
                    >
                        {cancelling ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Yes, Cancel Slot'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snacking notifications */}
            <Snackbar
                open={!!successMsg}
                autoHideDuration={4000}
                onClose={() => setSuccessMsg('')}
            >
                <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
                    {successMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};
