import { useState, useEffect, useCallback } from 'react';
import { 
    Box, Card, CardContent, Typography, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, 
    CircularProgress, Alert, Snackbar, Paper, Tabs, Tab, Grid, 
    Select, MenuItem, TextField, FormControl, InputLabel
} from '@mui/material';
import { Calendar, Trash2, Clock, Award, Users, Check, X } from 'lucide-react';
import { PageHeader } from '../../../shared/components/ui';
import { schedulingApi } from '../../scheduling/services/schedulingApi';
import { useAuth } from '../../auth/hooks/useAuth';

// Days mapping
const DAYS_OF_WEEK = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
];

/**
 * DoctorDashboard — High-density clinical console for medical professionals.
 * Features a tabbed workspace:
 *   1. Today's Consult Queue: Real-time listing of daily appointments with complete/cancel actions.
 *   2. Shift Scheduler: Configure weekly availabilities and slot durations.
 */
export const DoctorDashboard = () => {
    const { user } = useAuth();
    const [tabVal, setTabVal] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [loadingAppts, setLoadingAppts] = useState(false);
    const [loadingAvs, setLoadingAvs] = useState(false);
    
    // Status alerts
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Availability form fields
    const [newDay, setNewDay] = useState(0);
    const [newStart, setNewStart] = useState('09:00');
    const [newEnd, setNewEnd] = useState('12:00');
    const [newDuration, setNewDuration] = useState(15);
    const [submittingAv, setSubmittingAv] = useState(false);

    // Fetch daily appointments queue
    const loadQueue = useCallback(async () => {
        if (!user) return;
        setLoadingAppts(true);
        setErrorMsg('');
        try {
            // Get all appointments assigned to this doctor
            const data = await schedulingApi.getAppointments();
            setAppointments(data);
        } catch {
            setErrorMsg('Failed to load consultation queue.');
        } finally {
            setLoadingAppts(false);
        }
    }, [user]);

    // Fetch shift availabilities
    const loadAvailabilities = useCallback(async () => {
        if (!user) return;
        setLoadingAvs(true);
        try {
            // Retrieve doctor profile first
            const docs = await schedulingApi.getDoctors();
            const currentDoc = docs.find(d => d.user.id === user.id);
            if (currentDoc) {
                const avData = await schedulingApi.getDoctorAvailabilities(currentDoc.id);
                setAvailabilities(avData);
            }
        } catch {
            setErrorMsg('Failed to retrieve shift availabilities.');
        } finally {
            setLoadingAvs(false);
        }
    }, [user]);

    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (!active) return;
            if (tabVal === 0) loadQueue();
            else loadAvailabilities();
        });
        return () => {
            active = false;
        };
    }, [tabVal, loadQueue, loadAvailabilities]);

    // Handle appointment status change (complete/cancel)
    const handleStatusChange = async (id, status) => {
        try {
            await schedulingApi.updateAppointmentStatus(id, status);
            setSuccessMsg(`Appointment marked as ${status.toLowerCase()}.`);
            loadQueue();
        } catch {
            setErrorMsg('Failed to update appointment status.');
        }
    };

    // Add availability slot
    const handleAddAvailability = async (e) => {
        e.preventDefault();
        setSubmittingAv(true);
        setErrorMsg('');
        try {
            // Get doctor profile ID
            const docs = await schedulingApi.getDoctors();
            const currentDoc = docs.find(d => d.user.id === user.id);
            if (!currentDoc) {
                setErrorMsg('Doctor profile record not found.');
                setSubmittingAv(false);
                return;
            }

            const payload = {
                doctor: currentDoc.id,
                day_of_week: newDay,
                start_time: `${newStart}:00`,
                end_time: `${newEnd}:00`,
                slot_duration: newDuration
            };

            await schedulingApi.createDoctorAvailability(payload);
            setSuccessMsg('New shift availability published successfully.');
            loadAvailabilities();
        } catch (err) {
            setErrorMsg(
                err.response?.data?.non_field_errors?.[0] || 
                err.response?.data?.detail || 
                'Failed to add availability. Verify start time precedes end time.'
            );
        } finally {
            setSubmittingAv(false);
        }
    };

    // Delete availability slot
    const handleDeleteAvailability = async (id) => {
        try {
            await schedulingApi.deleteDoctorAvailability(id);
            setSuccessMsg('Shift availability removed.');
            loadAvailabilities();
        } catch {
            setErrorMsg('Failed to delete availability.');
        }
    };

    // Calculate queue metrics
    const totalQueue = appointments.length;
    const activeConsults = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
    const completedConsults = appointments.filter(a => a.status === 'COMPLETED').length;

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
            <PageHeader 
                title="Clinical Console Workspace" 
                subtitle="Manage your patients, consult queue, and configure weekly shift availabilities."
            />

            {/* Tabs Selector */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 3 }}>
                <Tabs 
                    value={tabVal} 
                    onChange={(e, val) => setTabVal(val)} 
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Today's Consult Queue" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
                    <Tab label="Weekly Shift Scheduler" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
                </Tabs>
            </Box>

            {errorMsg && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>{errorMsg}</Alert>
                </Box>
            )}

            {/* TAB 0: TODAY'S CONSULT QUEUE */}
            {tabVal === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* KPI Metrics */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(0, 106, 106, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', flexShrink: 0 }}>
                                        <Users size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Total Bookings
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                            {totalQueue}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(13, 110, 253, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.main', flexShrink: 0 }}>
                                        <Clock size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Active Queue
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                            {activeConsults}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(22, 163, 74, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main', flexShrink: 0 }}>
                                        <Award size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Completed Visits
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                                            {completedConsults}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Table List */}
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                        {loadingAppts ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress size={35} />
                            </Box>
                        ) : appointments.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, color: 'text.disabled' }}>
                                <Calendar size={50} style={{ opacity: 0.3, marginBottom: 16 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px', color: 'text.primary' }}>
                                    Queue is Empty
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    No patient consultations are scheduled for your account.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Patient Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Medical Record (MRN)</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Time Interval</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Symptom Reason</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {appointments.map((appt) => {
                                            const isActive = appt.status === 'PENDING' || appt.status === 'CONFIRMED';
                                            return (
                                                <TableRow key={appt.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>{appt.patient_name}</TableCell>
                                                    <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'text.secondary' }}>
                                                        {appt.patient_mrn}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(appt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                                                        {formatTimeLabel(appt.start_time)} - {formatTimeLabel(appt.end_time)}
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {appt.reason || 'No description'}
                                                    </TableCell>
                                                    <TableCell>{getStatusChip(appt.status)}</TableCell>
                                                    <TableCell align="right">
                                                        {isActive ? (
                                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                                <IconButton 
                                                                    color="success"
                                                                    onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                                                                    sx={{ color: 'success.main', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.05)' } }}
                                                                    title="Complete Consultation"
                                                                >
                                                                    <Check size={18} />
                                                                </IconButton>
                                                                <IconButton 
                                                                    color="error"
                                                                    onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                                                                    sx={{ color: '#BA1A1A', '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.05)' } }}
                                                                    title="Cancel Consultation"
                                                                >
                                                                    <X size={18} />
                                                                </IconButton>
                                                            </Box>
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
                </Box>
            )}

            {/* TAB 1: WEEKLY SHIFT SCHEDULER */}
            {tabVal === 1 && (
                <Grid container spacing={3}>
                    {/* Add Availability Card */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                    Publish Availability Shift
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                    Define your clinical shift hours and default booking interval constraints.
                                </Typography>
                            </Box>
                            
                            <CardContent component="form" onSubmit={handleAddAvailability} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Day select */}
                                <FormControl fullWidth>
                                    <InputLabel id="day-select-label">Weekly Day Slot</InputLabel>
                                    <Select
                                        labelId="day-select-label"
                                        value={newDay}
                                        onChange={(e) => setNewDay(e.target.value)}
                                        label="Weekly Day Slot"
                                    >
                                        {DAYS_OF_WEEK.map(day => (
                                            <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Time fields */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Shift Start"
                                        type="time"
                                        value={newStart}
                                        onChange={(e) => setNewStart(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        label="Shift End"
                                        type="time"
                                        value={newEnd}
                                        onChange={(e) => setNewEnd(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Box>

                                {/* Duration select */}
                                <FormControl fullWidth>
                                    <InputLabel id="duration-select-label">Consultation Slot Duration</InputLabel>
                                    <Select
                                        labelId="duration-select-label"
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(e.target.value)}
                                        label="Consultation Slot Duration"
                                    >
                                        <MenuItem value={15}>15 Minutes</MenuItem>
                                        <MenuItem value={30}>30 Minutes</MenuItem>
                                        <MenuItem value={45}>45 Minutes</MenuItem>
                                        <MenuItem value={60}>60 Minutes</MenuItem>
                                    </Select>
                                </FormControl>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={submittingAv}
                                    sx={{
                                        borderRadius: '100px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.2,
                                        mt: 1,
                                        background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                    }}
                                >
                                    {submittingAv ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Publish Shift'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Active Availability list */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                    Active Published Shifts
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                    Review your active hours currently visible on the Patient booking registry.
                                </Typography>
                            </Box>

                            {loadingAvs ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={30} />
                                </Box>
                            ) : availabilities.length === 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: 'text.disabled' }}>
                                    <Calendar size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <Typography variant="body2">No active shifts published.</Typography>
                                    <Typography variant="caption" sx={{ mt: 0.5 }}>Publish your first slot shift on the left.</Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Weekday</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Active Time</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Slot Duration</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {availabilities.map((av) => {
                                                const dayLabel = DAYS_OF_WEEK.find(d => d.value === av.day_of_week)?.label || av.day_of_week;
                                                return (
                                                    <TableRow key={av.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{dayLabel}</TableCell>
                                                        <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                                                            {formatTimeLabel(av.start_time)} - {formatTimeLabel(av.end_time)}
                                                        </TableCell>
                                                        <TableCell>{av.slot_duration} mins</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDeleteAvailability(av.id)}
                                                                sx={{ color: '#BA1A1A', '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.05)' } }}
                                                                title="Delete Shift"
                                                            >
                                                                <Trash2 size={16} />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            )}

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
