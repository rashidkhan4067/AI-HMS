import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, 
    CircularProgress, Alert, Snackbar, Paper, Dialog, DialogTitle, 
    DialogContent, DialogContentText, DialogActions, ToggleButtonGroup, ToggleButton,
    Tabs, Tab, useTheme, Divider
} from '@mui/material';
import { Calendar, Trash2, Plus, Clock, ShieldAlert, Award, FileText, CalendarDays, List as ListIcon, User, Clipboard, Pill, FlaskConical, Image } from 'lucide-react';
import { PageHeader, StatusChip } from '../../../shared/components/ui';
import { formatTimeLabel } from '../../../shared/utils/dateUtils';
import { schedulingApi } from '../../scheduling/services/schedulingApi';
import { BookAppointmentDialog } from '../../scheduling/components/BookAppointmentDialog';
import { InteractiveCalendar } from '../../scheduling/components/InteractiveCalendar';
import { MedicalRecordDetailsDialog } from '../../records/components/MedicalRecordDetailsDialog';
import { recordsApi } from '../../records/services/recordsApi';

/**
 * PatientDashboard — Personal health portal consultation logs and booking screen.
 * Displays KPI cards, lists upcoming and historical appointments, and allows patients
 * to cancel slot reservations or book new ones via the wizard dialog.
 */
export const PatientDashboard = () => {
    const theme = useTheme();
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

    // Calendar view toggles
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Tabs & Medical records states
    const [tabVal, setTabVal] = useState(0);
    const [patientRecords, setPatientRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [recordDetailOpen, setRecordDetailOpen] = useState(false);

    // Patient diagnostics state
    const [patientDiagnostics, setPatientDiagnostics] = useState([]);
    const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [diagnosticDetailOpen, setDiagnosticDetailOpen] = useState(false);

    const loadPatientDiagnostics = async () => {
        setLoadingDiagnostics(true);
        try {
            const data = await recordsApi.getDiagnosticOrders();
            setPatientDiagnostics(data);
        } catch {
            setErrorMsg('Failed to load your laboratory and scans history.');
        } finally {
            setLoadingDiagnostics(false);
        }
    };

    const loadPatientRecords = async () => {
        setLoadingRecords(true);
        try {
            const data = await recordsApi.getRecords();
            setPatientRecords(data);
        } catch {
            setErrorMsg('Failed to load your clinical health records.');
        } finally {
            setLoadingRecords(false);
        }
    };

    useEffect(() => {
        if (tabVal === 1) {
            loadPatientRecords();
        } else if (tabVal === 2) {
            loadPatientDiagnostics();
        }
    }, [tabVal]);

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
            if (active) {
                loadAppointments();
                loadPatientRecords();
                loadPatientDiagnostics();
            }
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

            {/* Tabs Selector */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 3 }}>
                <Tabs 
                    value={tabVal} 
                    onChange={(e, val) => setTabVal(val)} 
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="My Consultations" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
                    <Tab label="My Medical Records" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
                    <Tab label="Laboratory & Scans" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
                </Tabs>
            </Box>

            {/* TAB 0: MY CONSULTATIONS */}
            {tabVal === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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

            {/* Latest Clinical Diagnosis & Treatment Plan Widget */}
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover' }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(0, 106, 106, 0.05)', color: '#006A6A', display: 'flex' }}>
                        <Clipboard size={18} />
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px' }}>
                            Latest Clinical Diagnosis & Treatment Plan
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                            Your most recent clinical evaluation, diagnosis, and prescription details.
                        </Typography>
                    </Box>
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                    {loadingRecords ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : patientRecords.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, color: 'text.secondary', textAlign: 'center' }}>
                            <Clipboard size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                No Clinical Records Found
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 450, mt: 0.5 }}>
                                Once you complete a consultation and your physician finalizes your medical report, it will be displayed here for quick access.
                            </Typography>
                        </Box>
                    ) : (() => {
                        // Find the latest record
                        const latestRec = [...patientRecords].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
                        return (
                            <Grid container spacing={3}>
                                {/* Diagnosis Details */}
                                <Grid item xs={12} md={7}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif" }}>
                                                    Dr. {latestRec.doctor_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {latestRec.doctor_specialization}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={`Consulted on: ${new Date(latestRec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 600, fontSize: '11px', borderColor: 'divider' }}
                                            />
                                        </Box>
                                        
                                        <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,106,106,0.02)', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Clinical Diagnosis
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                {latestRec.diagnosis}
                                            </Typography>
                                        </Box>
                                        
                                        {latestRec.advice && (
                                            <Box sx={{ px: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '10px', textTransform: 'uppercase' }}>
                                                    Physician Advice
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                                                    {latestRec.advice}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                                
                                {/* Prescription details */}
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ 
                                        p: 2.5, 
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', 
                                        borderRadius: '20px', 
                                        border: '1px solid', 
                                        borderColor: 'divider',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                            <Pill size={16} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                                Active Prescriptions (Rx)
                                            </Typography>
                                        </Box>
                                        
                                        {latestRec.prescription ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {latestRec.prescription.split('\n').filter(line => line.trim().length > 0).map((med, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                                                        <Typography variant="body2" sx={{ fontSize: '13.5px', color: 'text.primary', fontWeight: 550, fontFamily: 'monospace' }}>
                                                            {med}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                No specific prescription medications were recorded for this encounter.
                                            </Typography>
                                        )}
                                        
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => {
                                                setSelectedRecord(latestRec);
                                                setRecordDetailOpen(true);
                                            }}
                                            sx={{ mt: 'auto', textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start', p: 0, minHeight: 0 }}
                                        >
                                            View Detailed Record
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* View mode toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, val) => val && setViewMode(val)}
                    size="small"
                    sx={{
                        bgcolor: 'action.hover',
                        p: 0.5,
                        borderRadius: '12px',
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '8px',
                            px: 2.5,
                            py: 0.75,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            display: 'flex',
                            gap: 1,
                            '&.Mui-selected': {
                                bgcolor: 'background.paper',
                                color: 'primary.main',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }
                        }
                    }}
                >
                    <ToggleButton value="list">
                        <ListIcon size={16} />
                        List View
                    </ToggleButton>
                    <ToggleButton value="calendar">
                        <CalendarDays size={16} />
                        Calendar View
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* List / Table of Consultations or Calendar View */}
            {viewMode === 'calendar' ? (
                <InteractiveCalendar
                    appointments={appointments}
                    role="PATIENT"
                    onAppointmentClick={(appt) => {
                        setSelectedAppt(appt);
                        setDetailOpen(true);
                    }}
                />
            ) : (
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
                                                <TableCell><StatusChip status={appt.status} /></TableCell>
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
            )}
                </Box>
            )}

            {/* TAB 1: MY MEDICAL RECORDS */}
            {tabVal === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                Personal Clinical Health Records
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                Review your completed consultations, physician diagnoses, advice, and prescriptions.
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            {loadingRecords ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={35} />
                                </Box>
                            ) : patientRecords.length === 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, color: 'text.disabled' }}>
                                    <Clipboard size={50} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px', color: 'text.primary' }}>
                                        No Records Available
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        Consultation records will appear here once finalized by your physician.
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {patientRecords.map((rec) => (
                                        <Grid item xs={12} sm={6} md={4} key={rec.id}>
                                            <Card
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedRecord(rec);
                                                    setRecordDetailOpen(true);
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    borderRadius: '20px',
                                                    p: 2.5,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                        {new Date(rec.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </Typography>
                                                    <Chip label={rec.doctor_specialization} size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px', fontWeight: 600 }} />
                                                </Box>

                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                                                    Dr. {rec.doctor_name}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '60px', lineHeight: 1.5, mb: 2 }}>
                                                    {rec.diagnosis}
                                                </Typography>

                                                {rec.prescription && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                                        <Pill size={14} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                            Includes Rx Prescription
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* TAB 2: LABORATORY & SCANS */}
            {tabVal === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                Laboratory Specimen & Radiological Scan Reports
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                Monitor your pending diagnostic procedures and read finalized reports issued by the clinical team.
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            {loadingDiagnostics ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={35} />
                                </Box>
                            ) : patientDiagnostics.length === 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, color: 'text.disabled' }}>
                                    <FlaskConical size={50} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px', color: 'text.primary' }}>
                                        No Diagnostic Orders Recorded
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        Diagnostic lab tests and scan files ordered by doctors will appear here.
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {patientDiagnostics.map((diag) => (
                                        <Grid item xs={12} sm={6} md={4} key={diag.id}>
                                            <Card
                                                variant="outlined"
                                                onClick={() => {
                                                    if (diag.status === 'COMPLETED') {
                                                        setSelectedDiagnostic(diag);
                                                        setDiagnosticDetailOpen(true);
                                                    }
                                                }}
                                                sx={{
                                                    cursor: diag.status === 'COMPLETED' ? 'pointer' : 'default',
                                                    borderRadius: '20px',
                                                    p: 2.5,
                                                    transition: 'all 0.2s',
                                                    '&:hover': diag.status === 'COMPLETED' ? {
                                                        borderColor: 'primary.main',
                                                        boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                                                        transform: 'translateY(-2px)'
                                                    } : {}
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                        {new Date(diag.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </Typography>
                                                    <Chip
                                                        label={diag.category}
                                                        size="small"
                                                        color={diag.category === 'LAB' ? 'primary' : 'secondary'}
                                                        variant="outlined"
                                                        sx={{ fontSize: '10px', height: '20px', fontWeight: 700 }}
                                                    />
                                                </Box>

                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                                    {diag.test_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                                    Ordered by: Dr. {diag.doctor_name}
                                                </Typography>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                    <Chip
                                                        label={diag.status}
                                                        size="small"
                                                        color={diag.status === 'COMPLETED' ? 'success' : 'warning'}
                                                        sx={{ fontSize: '10px', height: '20px', fontWeight: 700 }}
                                                    />
                                                    {diag.status === 'COMPLETED' ? (
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            View Report &rarr;
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                            Awaiting Specimen/Analysis
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}

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

            {/* Appointment Details Dialog (For Calendar View) */}
            <Dialog
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedAppt(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '28px', p: 1.5 }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Consultation Details
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {selectedAppt && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Doctor Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: '12px', display: 'flex' }}>
                                    <User size={20} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                        Dr. {selectedAppt.doctor_name || selectedAppt.doctor?.user?.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedAppt.doctor_specialization || selectedAppt.doctor?.specialization}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Schedule Info */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Calendar size={16} style={{ opacity: 0.6 }} />
                                    <Typography variant="body2">
                                        {new Date(selectedAppt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Clock size={16} style={{ opacity: 0.6 }} />
                                    <Typography variant="body2">
                                        {formatTimeLabel(selectedAppt.start_time)} - {formatTimeLabel(selectedAppt.end_time)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Status:</Typography>
                                        <StatusChip status={selectedAppt.status} />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Symptom Reason */}
                            {selectedAppt.reason && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: 'action.hover', borderRadius: '16px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <FileText size={16} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Reason for Booking</Typography>
                                    </Box>
                                    <Typography variant="body2">{selectedAppt.reason}</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        {selectedAppt && (selectedAppt.status === 'PENDING' || selectedAppt.status === 'CONFIRMED') && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    setDetailOpen(false);
                                    handleCancelClick(selectedAppt);
                                    setSelectedAppt(null);
                                }}
                                sx={{ minHeight: '38px', borderRadius: '10px' }}
                            >
                                Cancel Booking
                            </Button>
                        )}
                    </Box>
                    <Button 
                        onClick={() => {
                            setDetailOpen(false);
                            setSelectedAppt(null);
                        }}
                        variant="contained"
                        sx={{ minHeight: '38px', borderRadius: '10px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Historical Encounter Record Details Dialog */}
            <MedicalRecordDetailsDialog
                open={recordDetailOpen}
                onClose={() => {
                    setRecordDetailOpen(false);
                    setSelectedRecord(null);
                }}
                record={selectedRecord}
            />

            {/* Diagnostic Report Details Dialog */}
            <Dialog
                open={diagnosticDetailOpen}
                onClose={() => {
                    setDiagnosticDetailOpen(false);
                    setSelectedDiagnostic(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '28px', p: 1.5 }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Diagnostic Report Details
                    </Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: '60vh', overflowY: 'auto' }}>
                    {selectedDiagnostic && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PATIENT</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedDiagnostic.patient_name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>MRN: {selectedDiagnostic.patient_mrn}</Typography>
                                </Grid>
                                <Grid item xs={6} align="right">
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>TEST CATEGORY</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedDiagnostic.category}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>TEST NAME</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedDiagnostic.test_name}</Typography>
                                </Grid>
                                <Grid item xs={6} align="right">
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDERED BY</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Dr. {selectedDiagnostic.doctor_name}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>RESULTS SUMMARY</Typography>
                                <Chip label={selectedDiagnostic.result?.result_summary} color="success" size="medium" sx={{ fontWeight: 700, borderRadius: '8px' }} />
                            </Box>

                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>DETAILED OBSERVATIONS</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {selectedDiagnostic.result?.report_text}
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PERFORMED BY</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedDiagnostic.result?.performed_by_name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {selectedDiagnostic.category === 'LAB' ? 'Laboratory Technician' : 'Radiologist'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} align="right">
                                    {selectedDiagnostic.result?.attachment_url && (
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>ATTACHED REPORT FILE</Typography>
                                            <Button
                                                variant="text"
                                                color="primary"
                                                href={selectedDiagnostic.result.attachment_url}
                                                target="_blank"
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Download Report File
                                            </Button>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button 
                        onClick={() => {
                            setDiagnosticDetailOpen(false);
                            setSelectedDiagnostic(null);
                        }}
                        variant="contained"
                        sx={{ borderRadius: '10px' }}
                    >
                        Close
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
