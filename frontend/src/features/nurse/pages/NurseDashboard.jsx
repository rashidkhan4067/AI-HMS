import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, Button, Tab, Tabs, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, CircularProgress, Alert
} from '@mui/material';
import {
    Activity, Users, Search, RefreshCw, Clipboard, CheckCircle, Clock
} from 'lucide-react';
import { nurseApi } from '../services/nurseApi';
import VitalsLoggingDialog from '../components/VitalsLoggingDialog';

export const NurseDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [vitalsList, setVitalsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search filters
    const [queueSearch, setQueueSearch] = useState('');
    const [logsSearch, setLogsSearch] = useState('');

    // Dialog state
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);

    // Metrics state
    const [metrics, setMetrics] = useState({
        pendingTriage: 0,
        triagedToday: 0
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            
            // 1. Fetch appointments scheduled for today
            const apptsData = await nurseApi.getAppointments({ date: todayStr, status: 'CONFIRMED' });
            
            // Filter appointments: we want to triage patients who are checked-in (CONFIRMED)
            // but don't have vitals filled in yet!
            const pendingTriageList = apptsData.filter(a => !a.vitals);
            setAppointments(pendingTriageList);

            // 2. Fetch vitals recorded today
            const vitalsData = await nurseApi.getVitals();
            // Filter logs: only show vitals recorded today
            const dailyVitals = vitalsData.filter(v => v.created_at.startsWith(todayStr));
            setVitalsList(dailyVitals);

            // Calculate metrics
            setMetrics({
                pendingTriage: pendingTriageList.length,
                triagedToday: dailyVitals.length
            });
        } catch (err) {
            console.error('Error fetching triage dashboard data:', err);
            setError('Failed to load triage queue data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTriageSuccess = () => {
        fetchData();
    };

    const openTriageDialog = (appt) => {
        setSelectedAppt(appt);
        setVitalsDialogOpen(true);
    };

    // Filter lists
    const filteredQueue = appointments.filter(a => 
        (a.patient_name || '').toLowerCase().includes(queueSearch.toLowerCase()) ||
        (a.patient_mrn || '').toLowerCase().includes(queueSearch.toLowerCase()) ||
        (a.doctor_name || '').toLowerCase().includes(queueSearch.toLowerCase())
    );

    const filteredLogs = vitalsList.filter(v => 
        (v.patient_name || '').toLowerCase().includes(logsSearch.toLowerCase()) ||
        (v.patient_mrn || '').toLowerCase().includes(logsSearch.toLowerCase())
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Header Title Panel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(45deg, #006A6A 30%, #00a3a3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        Nurse Triage Workspace
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Log patient vitals, manage consult queues, and prepare patients for physician treatments.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    onClick={fetchData} 
                    startIcon={<RefreshCw size={16} />}
                    disabled={loading}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 2.5 }}
                >
                    Refresh Queue
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ borderRadius: '16px' }}>
                    {error}
                </Alert>
            )}

            {/* KPI Cards Grid */}
            <Grid container spacing={3}>
                {/* Metric 1 */}
                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2.5, borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.03) 0%, rgba(13, 110, 253, 0.01) 100%)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Awaiting Vitals / Triage
                            </Typography>
                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(13, 110, 253, 0.06)', color: 'info.main', display: 'flex' }}>
                                <Clock size={20} />
                            </Box>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 0.5 }}>
                            {metrics.pendingTriage}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                            Checked-in patients waiting for triage
                        </Typography>
                    </Card>
                </Grid>

                {/* Metric 2 */}
                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2.5, borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(76, 175, 80, 0.01) 100%)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Triaged Today
                            </Typography>
                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.08)', color: '#4CAF50', display: 'flex' }}>
                                <CheckCircle size={20} />
                            </Box>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 0.5 }}>
                            {metrics.triagedToday}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                            Patients processed by your station today
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Central Work Space tabs */}
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, val) => setActiveTab(val)}
                        sx={{ 
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' },
                            '& .MuiTab-root': { fontWeight: 700, fontSize: '14px', py: 2 }
                        }}
                    >
                        <Tab label="Active Triage Queue" />
                        <Tab label="Historical Triage Records" />
                    </Tabs>
                </Box>

                {/* Tab content panels */}
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    {/* Tab 0: Active Queue */}
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <TextField
                                    placeholder="Search by Patient name, MRN, or Physician..."
                                    value={queueSearch}
                                    onChange={(e) => setQueueSearch(e.target.value)}
                                    size="small"
                                    sx={{ width: { xs: '100%', sm: 360 }, '& .MuiOutlinedInput-root': { borderRadius: '100px', px: 1.5 } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={16} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                            ) : filteredQueue.length === 0 ? (
                                <Typography variant="body1" sx={{ py: 6, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                                    No patients are currently in the triage queue.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Physician</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Appointment Slot</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Triage Status</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredQueue.map((appt) => (
                                                <TableRow key={appt.id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{appt.patient_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>MRN: {appt.patient_mrn}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Dr. {appt.doctor_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{appt.doctor_specialization}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{appt.date}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label="Awaiting Vitals" size="small" color="warning" sx={{ fontWeight: 700, fontSize: '10px' }} />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 3 }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => openTriageDialog(appt)}
                                                            startIcon={<Clipboard size={14} />}
                                                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                                                        >
                                                            Log Vitals
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                    {/* Tab 1: Historical Triage Records */}
                    {activeTab === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <TextField
                                    placeholder="Search Triage Logs by Patient, MRN..."
                                    value={logsSearch}
                                    onChange={(e) => setLogsSearch(e.target.value)}
                                    size="small"
                                    sx={{ width: { xs: '100%', sm: 360 }, '& .MuiOutlinedInput-root': { borderRadius: '100px', px: 1.5 } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={16} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                            ) : filteredLogs.length === 0 ? (
                                <Typography variant="body1" sx={{ py: 6, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                                    No triage records filed today.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>BP (mmHg)</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>HR (bpm)</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Temp (°F)</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>SpO2 (%)</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Resp Rate</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Wt / Ht</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Logged Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredLogs.map((log) => (
                                                <TableRow key={log.id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{log.patient_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>MRN: {log.patient_mrn}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{log.blood_pressure}</TableCell>
                                                    <TableCell>{log.heart_rate}</TableCell>
                                                    <TableCell>{log.temperature}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: log.spo2 < 95 ? 'error.main' : 'inherit' }}>{log.spo2}%</TableCell>
                                                    <TableCell>{log.respiratory_rate || '-'}</TableCell>
                                                    <TableCell sx={{ fontSize: '13px' }}>
                                                        {log.weight ? `${log.weight} kg` : '-'} / {log.height ? `${log.height} cm` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                </Box>
            </Card>

            {/* Vitals Form Dialog */}
            <VitalsLoggingDialog
                open={vitalsDialogOpen}
                onClose={() => setVitalsDialogOpen(false)}
                appointment={selectedAppt}
                onSuccess={handleTriageSuccess}
            />
        </Box>
    );
};

export default NurseDashboard;
