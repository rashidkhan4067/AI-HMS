import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, Button, Tab, Tabs, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider
} from '@mui/material';
import {
    Users, UserCheck, DollarSign, Search, Calendar,
    RefreshCw, CheckCircle, Receipt, ArrowRight, Printer, X
} from 'lucide-react';
import { receptionistApi } from '../services/receptionistApi';
import CheckInDialog from '../components/CheckInDialog';

export const ReceptionistDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [apptSearch, setApptSearch] = useState('');
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [patientSearch, setPatientSearch] = useState('');

    // Selected items for dialogs
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

    // Metrics
    const [metrics, setMetrics] = useState({
        registeredToday: 0,
        checkedInToday: 0,
        revenueToday: 0
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            
            // 1. Fetch appointments for today
            const apptsData = await receptionistApi.getAppointments({ date: todayStr });
            setAppointments(apptsData);

            // 2. Fetch invoices for today
            const invoicesData = await receptionistApi.getInvoices({ date: todayStr });
            setInvoices(invoicesData);

            // 3. Fetch patients (limited list for directory search)
            const patientsData = await receptionistApi.getPatients();
            setPatients(patientsData);

            // Calculate metrics
            const checkedIn = apptsData.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
            const revenue = invoicesData
                .filter(i => i.payment_status === 'PAID')
                .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

            // Fetch total registered patient profile counts for today
            // For safety, let's filter patient count created today
            const todayPatientCount = patientsData.filter(p => {
                if (!p.user || !p.user.created_at) return false;
                return p.user.created_at.startsWith(todayStr);
            }).length;

            setMetrics({
                registeredToday: todayPatientCount || patientsData.length, // fallback to total if none created today in dev DB
                checkedInToday: checkedIn,
                revenueToday: revenue
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCheckInSuccess = () => {
        fetchData();
    };

    const openCheckIn = (appt) => {
        setSelectedAppt(appt);
        setCheckInDialogOpen(true);
    };

    const openReceipt = (invoice) => {
        setSelectedInvoice(invoice);
        setReceiptDialogOpen(true);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    // Filter lists based on search
    const filteredAppointments = appointments.filter(a => 
        (a.patient_name || '').toLowerCase().includes(apptSearch.toLowerCase()) ||
        (a.patient_mrn || '').toLowerCase().includes(apptSearch.toLowerCase()) ||
        (a.doctor_name || '').toLowerCase().includes(apptSearch.toLowerCase())
    );

    const filteredInvoices = invoices.filter(i => 
        (i.patient_name || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        (i.patient_mrn || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        (i.doctor_name || '').toLowerCase().includes(invoiceSearch.toLowerCase())
    );

    const filteredPatients = patients.filter(p => 
        (p.user?.full_name || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
        (p.mrn || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
        (p.user?.phone || '').includes(patientSearch)
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            
            {/* Upper Title Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(45deg, #006A6A 30%, #00a3a3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        Receptionist Billing Console
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Manage daily patient arrivals, print invoice receipts, and check in clinical queues.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    onClick={fetchData} 
                    startIcon={<RefreshCw size={16} />}
                    disabled={loading}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 2.5 }}
                >
                    Refresh Dashboard
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ borderRadius: '16px' }}>
                    {error}
                </Alert>
            )}

            {/* KPI Metrics Cards */}
            <Grid container spacing={3}>
                {/* Metric 1 */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2.5, borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(0, 106, 106, 0.03) 0%, rgba(0, 163, 163, 0.01) 100%)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Patients Registered
                            </Typography>
                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(0, 106, 106, 0.06)', color: 'primary.main', display: 'flex' }}>
                                <Users size={20} />
                            </Box>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 0.5 }}>
                            {metrics.registeredToday}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                            Total patient files in directory
                        </Typography>
                    </Card>
                </Grid>

                {/* Metric 2 */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2.5, borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(0, 106, 106, 0.03) 0%, rgba(0, 163, 163, 0.01) 100%)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Checked-In / Confirmed
                            </Typography>
                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.08)', color: '#4CAF50', display: 'flex' }}>
                                <UserCheck size={20} />
                            </Box>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 0.5 }}>
                            {metrics.checkedInToday}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                            Patients pushed to doctor queues
                        </Typography>
                    </Card>
                </Grid>

                {/* Metric 3 */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2.5, borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(0, 106, 106, 0.03) 0%, rgba(0, 163, 163, 0.01) 100%)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Daily Billings Collected
                            </Typography>
                            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255, 152, 0, 0.08)', color: '#FF9800', display: 'flex' }}>
                                <DollarSign size={20} />
                            </Box>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 0.5 }}>
                            PKR {metrics.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
                            Consultation fees collected today
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Central Navigation Tabs */}
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, val) => setActiveTab(val)}
                        sx={{ 
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' },
                            '& .MuiTab-root': { fontWeight: 700, fontSize: '14px', py: 2, minWidth: 100 }
                        }}
                    >
                        <Tab label="Today's Consultation Registry" />
                        <Tab label="Billing Transactions Audit" />
                        <Tab label="Patient Search Directory" />
                    </Tabs>
                </Box>

                {/* Tab Content Panels */}
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    
                    {/* Tab 0: Consultation Registry */}
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <TextField
                                    placeholder="Search by Patient name, MRN, or Doctor..."
                                    value={apptSearch}
                                    onChange={(e) => setApptSearch(e.target.value)}
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
                            ) : filteredAppointments.length === 0 ? (
                                <Typography variant="body1" sx={{ py: 6, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                                    No pending or scheduled appointments found for today.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Physician</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Appointment Time</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Arrival Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredAppointments.map((appt) => (
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
                                                        <Chip 
                                                            label={appt.status} 
                                                            size="small" 
                                                            color={
                                                                appt.status === 'CONFIRMED' ? 'success' : 
                                                                appt.status === 'COMPLETED' ? 'info' : 
                                                                appt.status === 'CANCELLED' ? 'error' : 'warning'
                                                            } 
                                                            sx={{ fontWeight: 700, fontSize: '10px' }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 3 }}>
                                                        {appt.status === 'PENDING' ? (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => openCheckIn(appt)}
                                                                endIcon={<ArrowRight size={14} />}
                                                                sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                                                            >
                                                                Arrival Check-In
                                                            </Button>
                                                        ) : (
                                                            (() => {
                                                                // Find matching invoice for receipt view
                                                                const invoice = invoices.find(inv => inv.appointment === appt.id);
                                                                return invoice ? (
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => openReceipt(invoice)}
                                                                        startIcon={<Receipt size={14} />}
                                                                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                                                                    >
                                                                        View Receipt
                                                                    </Button>
                                                                ) : (
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                                        Check-in completed
                                                                    </Typography>
                                                                );
                                                            })()
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}

                    {/* Tab 1: Billing & Transactions Audit */}
                    {activeTab === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <TextField
                                    placeholder="Search Invoices by Patient, MRN, or Doctor..."
                                    value={invoiceSearch}
                                    onChange={(e) => setInvoiceSearch(e.target.value)}
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
                            ) : filteredInvoices.length === 0 ? (
                                <Typography variant="body1" sx={{ py: 6, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                                    No billing transactions recorded today.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Invoice ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Patient Details</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Amount Paid</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Receipt Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredInvoices.map((inv) => (
                                                <TableRow key={inv.id} hover>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {inv.id.substring(0, 8).toUpperCase()}...
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{inv.patient_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>MRN: {inv.patient_mrn}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Dr. {inv.doctor_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inv.doctor_specialization}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                        PKR {parseFloat(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={inv.payment_method} 
                                                            size="small" 
                                                            sx={{ fontWeight: 600, fontSize: '10px', bgcolor: 'rgba(0, 106, 106, 0.05)', color: 'primary.main' }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(inv.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 3 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => openReceipt(inv)}
                                                            startIcon={<Receipt size={14} />}
                                                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Print Receipt
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

                    {/* Tab 2: Patient Search Directory */}
                    {activeTab === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <TextField
                                    placeholder="Search directory by Patient MRN, Name, or Phone..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
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
                            ) : filteredPatients.length === 0 ? (
                                <Typography variant="body1" sx={{ py: 6, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                                    No patient profiles matching query found in the directory.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Medical Record Number (MRN)</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Phone Number</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredPatients.map((patient) => (
                                                <TableRow key={patient.id} hover>
                                                    <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                                                        {patient.mrn}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>
                                                        {patient.user?.full_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.user?.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.user?.phone || 'Not provided'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.user?.created_at ? new Date(patient.user.created_at).toLocaleDateString() : 'N/A'}
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

            {/* Check-In Action Modal */}
            <CheckInDialog
                open={checkInDialogOpen}
                onClose={() => setCheckInDialogOpen(false)}
                appointment={selectedAppt}
                onSuccess={handleCheckInSuccess}
            />

            {/* Digital Receipt / Printing Dialog */}
            <Dialog 
                open={receiptDialogOpen} 
                onClose={() => setReceiptDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '24px',
                            p: 3,
                            '@media print': {
                                boxShadow: 'none',
                                p: 0,
                                m: 0
                            }
                        }
                    }
                }}
            >
                {selectedInvoice && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, '@media print': { display: 'none' } }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                Transaction Details
                            </Typography>
                            <IconButton onClick={() => setReceiptDialogOpen(false)}>
                                <X size={20} />
                            </IconButton>
                        </Box>

                        <DialogContent id="printable-receipt" sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ textAlign: 'center', py: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'primary.main', mb: 0.5 }}>
                                    AI-HMS Receipt
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Official Consult Payment Receipt
                                </Typography>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Receipt / Invoice ID:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{selectedInvoice.id.toUpperCase()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Patient MRN:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedInvoice.patient_mrn}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Patient Name:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedInvoice.patient_name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Consulting Doctor:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Dr. {selectedInvoice.doctor_name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Specialization:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedInvoice.doctor_specialization}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Payment Method:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedInvoice.payment_method}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Transaction Status:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{selectedInvoice.payment_status}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Billing Date:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{new Date(selectedInvoice.created_at).toLocaleDateString()} {new Date(selectedInvoice.created_at).toLocaleTimeString()}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total Fee Paid:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: "'Outfit', sans-serif" }}>
                                    PKR {parseFloat(selectedInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <CheckCircle size={12} style={{ color: 'green' }} /> Securely processed by Receptionist Billing Console.
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 0, pt: 3, gap: 1.5, '@media print': { display: 'none' } }}>
                            <Button 
                                onClick={() => setReceiptDialogOpen(false)}
                                variant="outlined"
                                sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 2.5, borderColor: 'divider', color: 'text.primary' }}
                            >
                                Close
                            </Button>
                            <Button 
                                onClick={handlePrintReceipt}
                                variant="contained"
                                startIcon={<Printer size={14} />}
                                sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none' }}
                            >
                                Print Receipt
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default ReceptionistDashboard;
