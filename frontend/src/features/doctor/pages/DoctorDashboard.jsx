import { useState, useEffect, useCallback } from 'react';
import { 
    Box, Card, CardContent, Typography, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, 
    CircularProgress, Alert, Snackbar, Paper, Tabs, Tab, Grid, 
    Select, MenuItem, TextField, FormControl, InputLabel,
    ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Calendar, Trash2, Clock, Award, Users, Check, X, CalendarDays, List as ListIcon, User, FileText, Search, Clipboard, Pill, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import { PageHeader, StatusChip, StatGrid, StatCard, DataTable } from '../../../shared/components/ui';
import { formatTimeLabel } from '../../../shared/utils/dateUtils';
import { schedulingApi } from '../../scheduling/services/schedulingApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { InteractiveCalendar } from '../../scheduling/components/InteractiveCalendar';
import { CreateMedicalRecordDialog } from '../../records/components/CreateMedicalRecordDialog';
import { MedicalRecordDetailsDialog } from '../../records/components/MedicalRecordDetailsDialog';
import { recordsApi } from '../../records/services/recordsApi';

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

const checkVitalStatus = (vitals) => {
    if (!vitals) return { isCritical: false, alerts: [] };
    const alerts = [];
    
    // Check SpO2
    const spo2 = parseFloat(vitals.spo2);
    if (!isNaN(spo2) && spo2 < 95) {
        alerts.push(`Low SpO2: ${vitals.spo2}%`);
    }
    
    // Check Heart Rate
    const hr = parseFloat(vitals.heart_rate);
    if (!isNaN(hr)) {
        if (hr > 100) alerts.push(`Tachycardia: ${vitals.heart_rate} bpm`);
        else if (hr < 60) alerts.push(`Bradycardia: ${vitals.heart_rate} bpm`);
    }
    
    // Check Temperature
    const temp = parseFloat(vitals.temperature);
    if (!isNaN(temp)) {
        if (temp > 100.4) alerts.push(`Fever: ${vitals.temperature}°F`);
        else if (temp < 95.0) alerts.push(`Hypothermia: ${vitals.temperature}°F`);
    }
    
    // Check Blood Pressure (Systolic/Diastolic)
    if (vitals.blood_pressure && typeof vitals.blood_pressure === 'string') {
        const parts = vitals.blood_pressure.split('/');
        if (parts.length === 2) {
            const sys = parseFloat(parts[0]);
            const dia = parseFloat(parts[1]);
            if (!isNaN(sys) && !isNaN(dia)) {
                if (sys > 140 || dia > 90) alerts.push(`Hypertension: ${vitals.blood_pressure}`);
                else if (sys < 90 || dia < 60) alerts.push(`Hypotension: ${vitals.blood_pressure}`);
            }
        }
    }
    
    return {
        isCritical: alerts.length > 0,
        alerts
    };
};

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

    // View toggles
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Record documentation
    const [docCompletedAppt, setDocCompletedAppt] = useState(null);
    const [recordFormOpen, setRecordFormOpen] = useState(false);

    // Patient history lookup
    const [mrnSearch, setMrnSearch] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [recordDetailOpen, setRecordDetailOpen] = useState(false);

    // Patient diagnostics state
    const [patientDiagnostics, setPatientDiagnostics] = useState([]);
    const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [diagnosticDetailOpen, setDiagnosticDetailOpen] = useState(false);

    const handleSearchPatient = async (e) => {
        if (e) e.preventDefault();
        if (!mrnSearch.trim()) return;
        setLoadingPatients(true);
        setErrorMsg('');
        setSelectedPatient(null);
        setPatientRecords([]);
        try {
            const params = {};
            if (mrnSearch.toUpperCase().startsWith('MRN-')) {
                params.mrn = mrnSearch.trim();
            } else {
                params.name = mrnSearch.trim();
            }
            const data = await recordsApi.getPatients(params);
            setPatientSearchResults(data);
            if (data.length === 0) {
                setErrorMsg('No patient profiles match the entered MRN or Name.');
            }
        } catch {
            setErrorMsg('Failed to query patient database.');
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        setLoadingRecords(true);
        setLoadingDiagnostics(true);
        try {
            const data = await recordsApi.getRecords({ patient_id: patient.id });
            setPatientRecords(data);
        } catch {
            setErrorMsg('Failed to load patient historical medical files.');
        } finally {
            setLoadingRecords(false);
        }

        try {
            const diagData = await recordsApi.getDiagnosticOrders({ patient_id: patient.id });
            setPatientDiagnostics(diagData);
        } catch {
            setErrorMsg('Failed to load patient historical diagnostic logs.');
        } finally {
            setLoadingDiagnostics(false);
        }
    };

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
            else if (tabVal === 2) loadAvailabilities();
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

    const consultColumns = [
        {
            id: 'patient_name',
            label: 'Patient Name',
            render: (appt) => {
                const isActive = appt.status === 'PENDING' || appt.status === 'CONFIRMED';
                const { isCritical } = checkVitalStatus(appt.vitals);
                return (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{appt.patient_name}</Typography>
                            {isActive && isCritical && (
                                <Chip 
                                    icon={<AlertTriangle size={10} style={{ color: '#BA1A1A' }} />}
                                    label="CRITICAL VITALS" 
                                    size="small" 
                                    sx={{ 
                                        height: 16, 
                                        fontSize: '8.5px', 
                                        fontWeight: 800, 
                                        color: '#BA1A1A', 
                                        bgcolor: 'rgba(186, 26, 26, 0.08)',
                                        border: 'none',
                                        '& .MuiChip-icon': { marginLeft: '4px', marginRight: '-2px' }
                                    }} 
                                />
                            )}
                        </Box>
                        {appt.vitals ? (
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={`BP: ${appt.vitals.blood_pressure}`} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                        fontSize: '10px', 
                                        height: '18px', 
                                        borderColor: appt.vitals.blood_pressure && (parseFloat(appt.vitals.blood_pressure.split('/')[0]) > 140 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) > 90 || parseFloat(appt.vitals.blood_pressure.split('/')[0]) < 90 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) < 60) ? 'error.main' : 'rgba(0,0,0,0.1)',
                                        color: appt.vitals.blood_pressure && (parseFloat(appt.vitals.blood_pressure.split('/')[0]) > 140 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) > 90 || parseFloat(appt.vitals.blood_pressure.split('/')[0]) < 90 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) < 60) ? 'error.main' : 'text.primary',
                                        bgcolor: appt.vitals.blood_pressure && (parseFloat(appt.vitals.blood_pressure.split('/')[0]) > 140 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) > 90 || parseFloat(appt.vitals.blood_pressure.split('/')[0]) < 90 || parseFloat(appt.vitals.blood_pressure.split('/')[1]) < 60) ? 'rgba(186, 26, 26, 0.05)' : 'transparent'
                                    }} 
                                />
                                <Chip 
                                    label={`Temp: ${appt.vitals.temperature}°F`} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                        fontSize: '10px', 
                                        height: '18px', 
                                        borderColor: appt.vitals.temperature && (parseFloat(appt.vitals.temperature) > 100.4 || parseFloat(appt.vitals.temperature) < 95) ? 'error.main' : 'rgba(0,0,0,0.1)',
                                        color: appt.vitals.temperature && (parseFloat(appt.vitals.temperature) > 100.4 || parseFloat(appt.vitals.temperature) < 95) ? 'error.main' : 'text.primary',
                                        bgcolor: appt.vitals.temperature && (parseFloat(appt.vitals.temperature) > 100.4 || parseFloat(appt.vitals.temperature) < 95) ? 'rgba(186, 26, 26, 0.05)' : 'transparent'
                                    }} 
                                />
                                <Chip 
                                    label={`SpO2: ${appt.vitals.spo2}%`} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                        fontSize: '10px', 
                                        height: '18px', 
                                        borderColor: appt.vitals.spo2 && parseFloat(appt.vitals.spo2) < 95 ? 'error.main' : 'rgba(0,0,0,0.1)',
                                        color: appt.vitals.spo2 && parseFloat(appt.vitals.spo2) < 95 ? 'error.main' : 'text.primary',
                                        bgcolor: appt.vitals.spo2 && parseFloat(appt.vitals.spo2) < 95 ? 'rgba(186, 26, 26, 0.05)' : 'transparent'
                                    }} 
                                />
                                <Chip 
                                    label={`HR: ${appt.vitals.heart_rate} bpm`} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                        fontSize: '10px', 
                                        height: '18px', 
                                        borderColor: appt.vitals.heart_rate && (parseFloat(appt.vitals.heart_rate) > 100 || parseFloat(appt.vitals.heart_rate) < 60) ? 'error.main' : 'rgba(0,0,0,0.1)',
                                        color: appt.vitals.heart_rate && (parseFloat(appt.vitals.heart_rate) > 100 || parseFloat(appt.vitals.heart_rate) < 60) ? 'error.main' : 'text.primary',
                                        bgcolor: appt.vitals.heart_rate && (parseFloat(appt.vitals.heart_rate) > 100 || parseFloat(appt.vitals.heart_rate) < 60) ? 'rgba(186, 26, 26, 0.05)' : 'transparent'
                                    }} 
                                />
                            </Box>
                        ) : (
                            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', mt: 0.5, fontWeight: 600 }}>
                                No vitals logged
                            </Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            id: 'patient_mrn',
            label: 'Medical Record (MRN)',
            render: (appt) => <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>{appt.patient_mrn}</Typography>
        },
        {
            id: 'date',
            label: 'Date',
            render: (appt) => new Date(appt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        },
        {
            id: 'time',
            label: 'Time Interval',
            render: (appt) => <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 500 }}>{formatTimeLabel(appt.start_time)} - {formatTimeLabel(appt.end_time)}</Typography>
        },
        {
            id: 'reason',
            label: 'Symptom Reason',
            render: (appt) => <Box sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.reason || 'No description'}</Box>
        },
        {
            id: 'status',
            label: 'Status',
            render: (appt) => <StatusChip status={appt.status} />
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (appt) => {
                const isActive = appt.status === 'PENDING' || appt.status === 'CONFIRMED';
                if (!isActive) return <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No Actions</Typography>;
                
                return (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton 
                            color="success"
                            onClick={() => {
                                setDocCompletedAppt(appt);
                                setRecordFormOpen(true);
                            }}
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
                );
            }
        }
    ];

    // Calculate queue metrics
    const totalQueue = appointments.length;
    const activeConsults = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
    const completedConsults = appointments.filter(a => a.status === 'COMPLETED').length;



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
                    <Tab label="Patient History Lookup" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14.5px' }} />
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
                    <StatGrid cols={3} sx={{ '& .MuiCard-root': { borderRadius: '20px', p: 1 }, '& .MuiTypography-h4': { fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }, '& .MuiBox-root': { flexShrink: 0 } }}>
                        <StatCard 
                            title="Total Bookings" 
                            value={totalQueue} 
                            icon={Users} 
                            color="#006a6a"
                            sx={{ '& > .MuiBox-root:first-of-type': { width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(0, 106, 106, 0.05)' } }}
                        />
                        <StatCard 
                            title="Active Queue" 
                            value={activeConsults} 
                            icon={Clock} 
                            color="#0d6efd"
                            sx={{ '& > .MuiBox-root:first-of-type': { width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(13, 110, 253, 0.05)' } }}
                        />
                        <StatCard 
                            title="Completed Visits" 
                            value={completedConsults} 
                            icon={Award} 
                            color="#16a34a"
                            sx={{ '& > .MuiBox-root:first-of-type': { width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(22, 163, 74, 0.05)' } }}
                        />
                    </StatGrid>

                    {/* Priority Triage Queue Insights Banner */}
                    {(() => {
                        const criticalPatients = appointments.filter(a => {
                            const { isCritical } = checkVitalStatus(a.vitals);
                            return (a.status === 'PENDING' || a.status === 'CONFIRMED') && isCritical;
                        });
                        if (criticalPatients.length === 0) return null;
                        
                        return (
                            <Alert 
                                severity="error" 
                                icon={<Activity size={20} />}
                                sx={{ 
                                    borderRadius: '16px', 
                                    border: '1px solid', 
                                    borderColor: 'error.light',
                                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.1)' : 'rgba(186, 26, 26, 0.03)',
                                    color: 'error.main',
                                    '& .MuiAlert-icon': { color: 'error.main' },
                                    mb: 2
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                    Attention Needed: {criticalPatients.length} patient{criticalPatients.length > 1 ? 's' : ''} in the queue flagged with out-of-range vital signs.
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                    Please prioritize: {criticalPatients.map(p => `${p.patient_name} (${p.patient_mrn})`).join(', ')}
                                </Typography>
                            </Alert>
                        );
                    })()}

                    {/* View mode toggle */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

                    {/* Table List or Calendar Grid */}
                    {viewMode === 'calendar' ? (
                        <InteractiveCalendar
                            appointments={appointments}
                            role="DOCTOR"
                            onAppointmentClick={(appt) => {
                                setSelectedAppt(appt);
                                setDetailOpen(true);
                            }}
                        />
                    ) : (
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
                                <Box sx={{ '& .MuiPaper-root': { border: 'none', borderRadius: 0 }, '& .MuiTableCell-root': { fontFamily: "'Outfit', sans-serif" }, '& .MuiTableRow-head': { bgcolor: 'action.hover' } }}>
                                    <DataTable columns={consultColumns} data={appointments} />
                                </Box>
                            )}
                        </Card>
                    )}
                </Box>
            )}

            {/* TAB 1: PATIENT HISTORY LOOKUP */}
            {tabVal === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                Patient History Directory
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                Look up clinical medical records and historical consult documentation by Patient MRN or Name.
                            </Typography>
                        </Box>
                        
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box component="form" onSubmit={handleSearchPatient} sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    placeholder="Enter Patient MRN (e.g. MRN-2026-0001) or Name..."
                                    value={mrnSearch}
                                    onChange={(e) => setMrnSearch(e.target.value)}
                                    fullWidth
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loadingPatients}
                                    sx={{ minWidth: '130px', borderRadius: '12px' }}
                                >
                                    {loadingPatients ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Search'}
                                </Button>
                            </Box>

                            {/* Search Results */}
                            {patientSearchResults.length > 0 && !selectedPatient && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                                        Matched Profiles
                                    </Typography>
                                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0 }}>
                                        {patientSearchResults.map((pat) => (
                                            <ListItem
                                                button
                                                key={pat.id}
                                                onClick={() => handleSelectPatient(pat)}
                                                sx={{
                                                    borderRadius: '16px',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    p: 2,
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: 'action.hover' }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            {pat.user.full_name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                                                            <Chip label={`MRN: ${pat.mrn}`} size="small" sx={{ fontSize: '11px', fontWeight: 600 }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Email: {pat.user.email} | Phone: {pat.user.phone || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Selected Patient History */}
                            {selectedPatient && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                                {selectedPatient.user.full_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                MRN: {selectedPatient.mrn} | Email: {selectedPatient.user.email}
                                            </Typography>
                                        </Box>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={() => {
                                                setSelectedPatient(null);
                                                setPatientRecords([]);
                                                setPatientDiagnostics([]);
                                            }}
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            Change Patient
                                        </Button>
                                    </Box>

                                    <Grid container spacing={3}>
                                        {/* Encounter Records Column */}
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                                                Encounter Records History
                                            </Typography>

                                            {loadingRecords ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                    <CircularProgress size={25} />
                                                </Box>
                                            ) : patientRecords.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', px: 1 }}>
                                                    No previous clinical encounter files recorded for this patient.
                                                </Typography>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    {patientRecords.map((rec) => (
                                                        <Grid item xs={12} key={rec.id}>
                                                            <Card
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    setSelectedRecord(rec);
                                                                    setRecordDetailOpen(true);
                                                                }}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    borderRadius: '16px',
                                                                    p: 2,
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        borderColor: 'primary.main',
                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                                                        transform: 'translateY(-1px)'
                                                                    }
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                                        {new Date(rec.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                        Dr. {rec.doctor_name}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                                                                    {rec.diagnosis.substring(0, 60)}{rec.diagnosis.length > 60 ? '...' : ''}
                                                                </Typography>
                                                                {rec.prescription && (
                                                                    <Chip label="Has Prescription" size="small" color="primary" variant="outlined" sx={{ fontSize: '10px', height: '20px', fontWeight: 600 }} />
                                                                )}
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            )}
                                        </Grid>

                                        {/* Diagnostic Orders Column */}
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                                                Diagnostics & Imaging History
                                            </Typography>

                                            {loadingDiagnostics ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                    <CircularProgress size={25} />
                                                </Box>
                                            ) : patientDiagnostics.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', px: 1 }}>
                                                    No laboratory or radiology diagnostic logs found.
                                                </Typography>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    {patientDiagnostics.map((diag) => (
                                                        <Grid item xs={12} key={diag.id}>
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
                                                                    borderRadius: '16px',
                                                                    p: 2,
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': diag.status === 'COMPLETED' ? {
                                                                        borderColor: 'primary.main',
                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                                                        transform: 'translateY(-1px)'
                                                                    } : {}
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                                        {new Date(diag.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={diag.category}
                                                                        size="small"
                                                                        color={diag.category === 'LAB' ? 'primary' : 'secondary'}
                                                                        variant="outlined"
                                                                        sx={{ fontSize: '9px', height: '18px', fontWeight: 700 }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                                                                    {diag.test_name}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                                                    <Chip
                                                                        label={diag.status}
                                                                        size="small"
                                                                        color={diag.status === 'COMPLETED' ? 'success' : 'warning'}
                                                                        sx={{ fontSize: '10px', height: '18px', fontWeight: 700 }}
                                                                    />
                                                                    {diag.status === 'COMPLETED' && (
                                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                                            View Results
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* TAB 2: WEEKLY SHIFT SCHEDULER */}
            {tabVal === 2 && (
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
                                                            {/* Patient Info */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                                                <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: '12px', display: 'flex' }}>
                                                                    <User size={20} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                                                        {selectedAppt.patient_name || selectedAppt.patient?.user?.full_name}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        MRN: {selectedAppt.patient_mrn || selectedAppt.patient?.mrn}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            {/* Triage Vitals Summary */}
                                                            {selectedAppt.vitals ? (
                                                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                                                        <Activity size={14} style={{ color: '#006A6A' }} /> TRIAGE VITALS SUMMARY
                                                                    </Typography>
                                                                    <Grid container spacing={1.5}>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Blood Pressure</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedAppt.vitals.blood_pressure} mmHg</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Heart Rate</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedAppt.vitals.heart_rate} bpm</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Temperature</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedAppt.vitals.temperature} °F</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Oxygen Saturation</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: selectedAppt.vitals.spo2 < 95 ? 'error.main' : 'inherit' }}>
                                                                                {selectedAppt.vitals.spo2} %
                                                                            </Typography>
                                                                        </Grid>
                                                                        {selectedAppt.vitals.respiratory_rate && (
                                                                            <Grid item xs={6} sm={4}>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Respiratory Rate</Typography>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedAppt.vitals.respiratory_rate} rpm</Typography>
                                                                            </Grid>
                                                                        )}
                                                                        {(selectedAppt.vitals.weight || selectedAppt.vitals.height) && (
                                                                            <Grid item xs={12} sm={4}>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Weight / Height</Typography>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                    {selectedAppt.vitals.weight ? `${selectedAppt.vitals.weight} kg` : '-'} / {selectedAppt.vitals.height ? `${selectedAppt.vitals.height} cm` : '-'}
                                                                                </Typography>
                                                                            </Grid>
                                                                        )}
                                                                    </Grid>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: '16px', border: '1px solid', borderColor: 'warning.light' }}>
                                                                    <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <ShieldAlert size={16} /> Awaiting Nurse Triage / Vitals Logging
                                                                    </Typography>
                                                                </Box>
                                                            )}

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
                                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Symptom Description</Typography>
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
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        setDocCompletedAppt(selectedAppt);
                                        setRecordFormOpen(true);
                                        setDetailOpen(false);
                                        setSelectedAppt(null);
                                    }}
                                    sx={{ minHeight: '38px', borderRadius: '10px' }}
                                >
                                    Complete
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                        handleStatusChange(selectedAppt.id, 'CANCELLED');
                                        setDetailOpen(false);
                                        setSelectedAppt(null);
                                    }}
                                    sx={{ minHeight: '38px', borderRadius: '10px' }}
                                >
                                    Cancel
                                </Button>
                            </Box>
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

            {/* Create Clinical Encounter Medical Record Dialog */}
            <CreateMedicalRecordDialog
                open={recordFormOpen}
                onClose={() => {
                    setRecordFormOpen(false);
                    setDocCompletedAppt(null);
                }}
                appointment={docCompletedAppt}
                onSubmitSuccess={() => {
                    setSuccessMsg('Consultation completed and clinical encounter notes successfully recorded.');
                    loadQueue();
                }}
            />

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
