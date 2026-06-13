import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, Button, Tab, Tabs, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider
} from '@mui/material';
import {
    Search, RefreshCw, Clock, CheckCircle, Image, Clipboard, AlertCircle, FileText
} from 'lucide-react';
import { radiologyApi } from '../services/radiologyApi';
import { formatDateTime as formatDateTimeShared } from '../../../shared/utils/dateUtils';

export const RadiologyDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search filters
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state for submitting results
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [resultSummary, setResultSummary] = useState('');
    const [reportText, setReportText] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Dialog state for viewing completed results
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);

    // Metrics state
    const [metrics, setMetrics] = useState({
        pendingCount: 0,
        completedToday: 0,
        totalOrders: 0
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await radiologyApi.getOrders();
            setOrders(data);

            const todayStr = new Date().toISOString().split('T')[0];
            const pendingList = data.filter(o => o.status === 'PENDING');
            const completedTodayList = data.filter(o => 
                o.status === 'COMPLETED' && 
                o.updated_at && 
                o.updated_at.startsWith(todayStr)
            );

            setMetrics({
                pendingCount: pendingList.length,
                completedToday: completedTodayList.length,
                totalOrders: data.length
            });
        } catch (err) {
            console.error('Error fetching radiology dashboard data:', err);
            setError('Failed to load radiology orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const openSubmitDialog = (order) => {
        setSelectedOrder(order);
        setResultSummary('');
        setReportText('');
        // Generate a clean mock image/report path based on test name and patient
        const formattedTest = order.test_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const formattedPatient = order.patient_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        setAttachmentUrl(`/reports/scan_${formattedTest}_${formattedPatient}.jpg`);
        setSubmitError(null);
        setSubmitDialogOpen(true);
    };

    const closeSubmitDialog = () => {
        setSubmitDialogOpen(false);
        setSelectedOrder(null);
    };

    const openViewDialog = (order) => {
        setViewOrder(order);
        setViewDialogOpen(true);
    };

    const closeViewDialog = () => {
        setViewDialogOpen(false);
        setViewOrder(null);
    };

    const handleSubmitResult = async (e) => {
        e.preventDefault();
        if (!resultSummary.trim() || !reportText.trim()) {
            setSubmitError('Please fill in both the findings summary and detailed observation report.');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        try {
            await radiologyApi.submitResult(selectedOrder.id, {
                result_summary: resultSummary,
                report_text: reportText,
                attachment_url: attachmentUrl
            });
            closeSubmitDialog();
            fetchData();
        } catch (err) {
            console.error('Error submitting scan report:', err);
            setSubmitError(err.response?.data?.detail || 'Failed to submit scan report. Please check the inputs.');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter lists
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');

    const filteredPending = pendingOrders.filter(o => {
        const patientName = o.patient_name || '';
        const patientMrn = o.patient_mrn || '';
        const testName = o.test_name || '';
        const query = searchTerm.toLowerCase();
        return patientName.toLowerCase().includes(query) || 
               patientMrn.toLowerCase().includes(query) ||
               testName.toLowerCase().includes(query);
    });

    const filteredCompleted = completedOrders.filter(o => {
        const patientName = o.patient_name || '';
        const patientMrn = o.patient_mrn || '';
        const testName = o.test_name || '';
        const query = searchTerm.toLowerCase();
        return patientName.toLowerCase().includes(query) || 
               patientMrn.toLowerCase().includes(query) ||
               testName.toLowerCase().includes(query);
    });

    const formatDateTime = (isoString) => formatDateTimeShared(isoString, { fallback: 'N/A' });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Header Title Panel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(45deg, #006A6A 30%, #00a3a3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        Radiology Workspace
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Manage imaging requests, process X-Ray/CT/MRI scans, and compile detailed diagnostic reports.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={16} />}
                    onClick={fetchData}
                    disabled={loading}
                    sx={{
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5
                    }}
                >
                    Refresh Queue
                </Button>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        p: 2.5,
                        borderRadius: '24px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                                PENDING SCAN REQUESTS
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '...' : metrics.pendingCount}
                            </Typography>
                        </Box>
                        <Box sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                            color: 'error.main',
                            p: 2,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={24} />
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        p: 2.5,
                        borderRadius: '24px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                                SCANS COMPLETED TODAY
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '...' : metrics.completedToday}
                            </Typography>
                        </Box>
                        <Box sx={{
                            bgcolor: 'rgba(0, 106, 106, 0.08)',
                            color: 'primary.main',
                            p: 2,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={24} />
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        p: 2.5,
                        borderRadius: '24px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                                TOTAL IMAGING ORDERS
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '...' : metrics.totalOrders}
                            </Typography>
                        </Box>
                        <Box sx={{
                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                            color: 'info.main',
                            p: 2,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image size={24} />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" icon={<AlertCircle size={20} />} sx={{ borderRadius: '16px' }}>
                    {error}
                </Alert>
            )}

            {/* Main Workspace Queue */}
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            minWidth: 120,
                            pb: 2
                        }
                    }}>
                        <Tab label={`Pending Scans (${filteredPending.length})`} />
                        <Tab label={`Completed Logs (${filteredCompleted.length})`} />
                    </Tabs>

                    <TextField
                        size="small"
                        placeholder="Search patient, MRN, or scan type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} style={{ color: '#888' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            mb: 2,
                            width: { xs: '100%', sm: '300px' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '100px',
                                backgroundColor: 'background.paper',
                            }
                        }}
                    />
                </Box>

                <Box sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8, gap: 2 }}>
                            <CircularProgress size={32} thickness={5} />
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Fetching imaging requests...
                            </Typography>
                        </Box>
                    ) : activeTab === 0 ? (
                        /* PENDING SCANS TABLE */
                        filteredPending.length === 0 ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <Clipboard size={48} style={{ strokeWidth: 1.5, color: '#999', marginBottom: '12px' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    No Pending Radiology Scans
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    X-Ray, CT, or MRI imaging requests ordered by doctors will appear here automatically.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'rgba(0, 106, 106, 0.02)' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Patient / MRN</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Scan Ordered</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Ordering Doctor</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Clinical Instructions</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredPending.map((order) => (
                                            <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        {order.patient_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                        MRN: {order.patient_mrn}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={order.test_name} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(0, 106, 106, 0.08)', color: 'primary.main', border: '1px solid rgba(0, 106, 106, 0.15)' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {order.doctor_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {order.doctor_specialization}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>
                                                    {formatDateTime(order.created_at)}
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                    {order.notes || <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No instructions provided</Typography>}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => openSubmitDialog(order)}
                                                        sx={{
                                                            borderRadius: '100px',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            px: 2,
                                                            boxShadow: 'none',
                                                            '&:hover': { boxShadow: 'none' }
                                                        }}
                                                    >
                                                        Upload Scan Report
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    ) : (
                        /* COMPLETED SCANS TABLE */
                        filteredCompleted.length === 0 ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <CheckCircle size={48} style={{ strokeWidth: 1.5, color: '#999', marginBottom: '12px' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    No Completed Scan Reports
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    Imaging scans and reports you complete will be logged in this history tab.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'rgba(0, 106, 106, 0.02)' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Patient / MRN</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Scan Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Findings Summary</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Ordering Doctor</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Completed Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredCompleted.map((order) => (
                                            <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        {order.patient_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                        MRN: {order.patient_mrn}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.test_name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                        {order.result?.result_summary}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.doctor_name}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>
                                                    {formatDateTime(order.result?.created_at)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => openViewDialog(order)}
                                                        startIcon={<FileText size={14} />}
                                                        sx={{
                                                            borderRadius: '100px',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            px: 2
                                                        }}
                                                    >
                                                        View Report
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    )}
                </Box>
            </Card>

            {/* DIALOG 1: SUBMIT RADIOLOGY FINDINGS */}
            <Dialog open={submitDialogOpen} onClose={closeSubmitDialog} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 1 } }}>
                <form onSubmit={handleSubmitResult}>
                    <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
                        Submit Radiology Scan Report
                    </DialogTitle>
                    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {submitError && (
                            <Alert severity="error" sx={{ borderRadius: '12px' }}>
                                {submitError}
                            </Alert>
                        )}
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PATIENT</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedOrder?.patient_name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>MRN: {selectedOrder?.patient_mrn}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDERED SCAN</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedOrder?.test_name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDERING CLINICIAN</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedOrder?.doctor_name}</Typography>
                            </Grid>
                        </Grid>

                        <Divider />

                        <TextField
                            label="Findings Summary"
                            placeholder="e.g. Normal chest radiograph, No acute intracranial pathology"
                            value={resultSummary}
                            onChange={(e) => setResultSummary(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: '12px' } }}
                        />

                        <TextField
                            label="Detailed Radiological Observations"
                            placeholder="Enter detailed observation notes about organs, tissues, bone structure, abnormalities..."
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            required
                            multiline
                            rows={6}
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: '12px' } }}
                        />

                        <TextField
                            label="Scan Image / Attachment URL"
                            placeholder="e.g. /reports/scan_chest_xray.jpg"
                            value={attachmentUrl}
                            onChange={(e) => setAttachmentUrl(e.target.value)}
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            helperText="Path to the captured medical scan image."
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, gap: 1 }}>
                        <Button onClick={closeSubmitDialog} disabled={submitting} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                            {submitting ? 'Publishing...' : 'Publish Scan Report'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* DIALOG 2: VIEW RADIOLOGY REPORT & SCAN */}
            <Dialog open={viewDialogOpen} onClose={closeViewDialog} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
                    Radiology Report Details
                </DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PATIENT DEMOGRAPHICS</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{viewOrder?.patient_name}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>MRN: {viewOrder?.patient_mrn}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} align="right">
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>REPORT METADATA</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Order ID: {viewOrder?.id.substring(0, 8)}...</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Completed: {formatDateTime(viewOrder?.result?.created_at)}</Typography>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>TEST CATEGORY</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>RADIOLOGY IMAGING</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDERED SCAN</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewOrder?.test_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDERING CLINICIAN</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{viewOrder?.doctor_name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{viewOrder?.doctor_specialization}</Typography>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>FINDINGS SUMMARY</Typography>
                        <Chip label={viewOrder?.result?.result_summary} color="success" size="medium" sx={{ fontWeight: 700, borderRadius: '8px' }} />
                    </Box>

                    <Box sx={{ bgcolor: 'action.hover', p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>DETAILED OBSERVATIONS</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
                            {viewOrder?.result?.report_text}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>RADIOLOGIST SIGN-OFF</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{viewOrder?.result?.performed_by_name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Certified Radiologist</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} align="right">
                            {viewOrder?.result?.attachment_url && (
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>ATTACHED CLINICAL IMAGING</Typography>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        startIcon={<Image size={16} />}
                                        href={viewOrder.result.attachment_url}
                                        target="_blank"
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        View Capture Scan
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={closeViewDialog} variant="contained" sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                        Close Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
