import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Typography, Card, Button, Tab, Tabs, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, CircularProgress, Alert
} from '@mui/material';
import {
    Activity, Search, RefreshCw, Clipboard, CheckCircle, Clock, Pill, DollarSign, ListOrdered
} from 'lucide-react';
import { pharmacyApi } from '../services/pharmacyApi';
import { DispenseMedicationDialog } from '../components/DispenseMedicationDialog';

import { formatDateTime as formatDateTimeShared } from '../../../shared/utils/dateUtils';

export const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [dispenses, setDispenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search filters
    const [pendingSearch, setPendingSearch] = useState('');
    const [historySearch, setHistorySearch] = useState('');

    // Dialog state
    const [selectedDispense, setSelectedDispense] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Simulated dispensary inventory
    const [inventory, setInventory] = useState([
        { name: 'Insulin (Glargine)', stock: 3, cap: 50, unit: 'vials', usage: 'High' },
        { name: 'Amoxicillin 500mg', stock: 8, cap: 100, unit: 'caps', usage: 'High' },
        { name: 'Metformin 1000mg', stock: 12, cap: 100, unit: 'tabs', usage: 'Med' },
        { name: 'Lipitor Atorvastatin 20mg', stock: 35, cap: 100, unit: 'tabs', usage: 'Med' },
        { name: 'Paracetamol 500mg', stock: 120, cap: 200, unit: 'tabs', usage: 'High' }
    ]);

    const handleRestock = (index) => {
        setInventory(prev => prev.map((item, idx) => {
            if (idx === index) {
                return { ...item, stock: item.stock + 50 };
            }
            return item;
        }));
    };

    // Metrics state
    const [metrics, setMetrics] = useState({
        pendingCount: 0,
        dispensedToday: 0,
        todayRevenue: 0
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const data = await pharmacyApi.getDispenses();
            setDispenses(data);

            // Calculate metrics
            const pendingList = data.filter(d => d.status === 'PENDING');
            const dispensedTodayList = data.filter(d => 
                d.status === 'DISPENSED' && 
                d.dispensed_at && 
                d.dispensed_at.startsWith(todayStr)
            );
            
            const revenue = dispensedTodayList.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

            setMetrics({
                pendingCount: pendingList.length,
                dispensedToday: dispensedTodayList.length,
                todayRevenue: revenue
            });
        } catch (err) {
            console.error('Error fetching pharmacy dashboard data:', err);
            setError('Failed to load prescription dispenses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDispenseDialog = (dispense) => {
        setSelectedDispense(dispense);
        setDialogOpen(true);
    };

    // Filter lists
    const pendingDispenses = dispenses.filter(d => d.status === 'PENDING');
    const historyDispenses = dispenses.filter(d => d.status === 'DISPENSED');

    const filteredPending = pendingDispenses.filter(d => {
        const patientName = d.medical_record?.patient?.user?.full_name || '';
        const patientMrn = d.medical_record?.patient?.mrn || '';
        const doctorName = d.medical_record?.doctor?.user?.full_name || '';
        const query = pendingSearch.toLowerCase();
        return patientName.toLowerCase().includes(query) || 
               patientMrn.toLowerCase().includes(query) || 
               doctorName.toLowerCase().includes(query);
    });

    const filteredHistory = historyDispenses.filter(d => {
        const patientName = d.medical_record?.patient?.user?.full_name || '';
        const patientMrn = d.medical_record?.patient?.mrn || '';
        const query = historySearch.toLowerCase();
        return patientName.toLowerCase().includes(query) || 
               patientMrn.toLowerCase().includes(query);
    });

    const formatDateTime = (isoString) => formatDateTimeShared(isoString, { fallback: 'N/A' });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Header Title Panel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(45deg, #006A6A 30%, #00a3a3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                        Dispensary Workspace
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Fulfill doctor prescriptions, compute medication costs, and view daily dispensing logs.
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

            {/* Metrics Cards Grid */}
            <Grid container spacing={3}>
                {/* Metric 1: Pending Orders */}
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
                                PENDING PRESCRIPTIONS
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

                {/* Metric 2: Dispensed Today */}
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
                                DISPENSED TODAY
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '...' : metrics.dispensedToday}
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
                            <Pill size={24} />
                        </Box>
                    </Card>
                </Grid>

                {/* Metric 3: Today's Revenue */}
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
                                TODAY'S PHARMACY REVENUE
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '...' : `$${metrics.todayRevenue.toFixed(2)}`}
                            </Typography>
                        </Box>
                        <Box sx={{
                            bgcolor: 'rgba(34, 197, 94, 0.08)',
                            color: 'success.main',
                            p: 2,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DollarSign size={24} />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Section */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: '16px' }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left Column: Dispensing Queue & History */}
                <Grid item xs={12} md={8}>
                    <Card sx={{
                        borderRadius: '24px',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.03)',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        height: '100%'
                    }}>
                        {/* Tabs selection */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newTab) => setActiveTab(newTab)}
                                textColor="primary"
                                indicatorColor="primary"
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        minWidth: 120,
                                        py: 2
                                    }
                                }}
                            >
                                <Tab label={`Pending Queue (${pendingDispenses.length})`} />
                                <Tab label={`Dispensed History (${historyDispenses.length})`} />
                            </Tabs>
                        </Box>

                        {/* Tab 0: Pending Queue */}
                        {activeTab === 0 && (
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Search Filter */}
                                <TextField
                                    placeholder="Search pending prescriptions by Patient Name, MRN or Doctor..."
                                    value={pendingSearch}
                                    onChange={(e) => setPendingSearch(e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={18} style={{ color: '#6b7280' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '12px' }
                                    }}
                                />

                                {loading && dispenses.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                        <CircularProgress color="primary" />
                                    </Box>
                                ) : filteredPending.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, textAlign: 'center', gap: 1.5 }}>
                                        <Clipboard size={44} style={{ color: '#9ca3af' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                            Queue is Empty
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                                            There are no prescriptions waiting to be dispensed matching your criteria.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: '16px' }}>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>MRN</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Prescription Rx</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredPending.map((dispense) => (
                                                    <TableRow key={dispense.id} hover>
                                                        <TableCell>{formatDateTime(dispense.created_at)}</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>
                                                            {dispense.medical_record?.patient?.user?.full_name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={dispense.medical_record?.patient?.mrn || 'N/A'}
                                                                size="small"
                                                                sx={{ fontWeight: 700, borderRadius: '8px', bgcolor: 'grey.100' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{dispense.medical_record?.doctor?.user?.full_name || 'N/A'}</TableCell>
                                                        <TableCell sx={{
                                                            maxWidth: 250,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {dispense.medical_record?.prescription}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<Pill size={14} />}
                                                                onClick={() => openDispenseDialog(dispense)}
                                                                sx={{
                                                                    borderRadius: '100px',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                    px: 2,
                                                                    boxShadow: 'none'
                                                                }}
                                                            >
                                                                Dispense
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

                        {/* Tab 1: Dispense History */}
                        {activeTab === 1 && (
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Search Filter */}
                                <TextField
                                    placeholder="Search completed logs by Patient Name or MRN..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={18} style={{ color: '#6b7280' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '12px' }
                                    }}
                                />

                                {loading && dispenses.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                        <CircularProgress color="primary" />
                                    </Box>
                                ) : filteredHistory.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, textAlign: 'center', gap: 1.5 }}>
                                        <Clipboard size={44} style={{ color: '#9ca3af' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                            No Dispensed History
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                                            No medicines have been marked as dispensed today.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: '16px' }}>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Dispensed Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>MRN</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Prescription Rx</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Medicine Cost</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Dispense Notes / Instructions</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Dispensed By</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredHistory.map((dispense) => (
                                                    <TableRow key={dispense.id} hover>
                                                        <TableCell>{formatDateTime(dispense.dispensed_at)}</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>
                                                            {dispense.medical_record?.patient?.user?.full_name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={dispense.medical_record?.patient?.mrn || 'N/A'}
                                                                size="small"
                                                                sx={{ fontWeight: 700, borderRadius: '8px', bgcolor: 'grey.100' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{
                                                            maxWidth: 200,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {dispense.medical_record?.prescription}
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>
                                                            ${parseFloat(dispense.amount || 0).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                            {dispense.notes || <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>None</Typography>}
                                                        </TableCell>
                                                        <TableCell>{dispense.dispensed_by?.full_name || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* Right Column: Dispensary Inventory Alert Console */}
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        borderRadius: '24px',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.03)',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        height: '100%'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(0, 106, 106, 0.05)', color: '#006A6A', display: 'flex' }}>
                                <Pill size={18} />
                            </Box>
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '17px' }}>
                                    Inventory Console
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    Real-time tracking of critical pharmaceutical stocks.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                            {inventory.map((item, idx) => {
                                const percentage = Math.min(100, Math.round((item.stock / item.cap) * 100));
                                let status = 'Optimal';
                                let statusColor = 'success.main';
                                let statusBg = 'rgba(22, 163, 74, 0.06)';
                                
                                if (item.stock <= 5) {
                                    status = 'Critical';
                                    statusColor = 'error.main';
                                    statusBg = 'rgba(186, 26, 26, 0.06)';
                                } else if (item.stock <= 15) {
                                    status = 'Low Stock';
                                    statusColor = 'warning.main';
                                    statusBg = 'rgba(255, 152, 0, 0.06)';
                                }

                                return (
                                    <Box key={idx} sx={{ pb: idx < inventory.length - 1 ? 2 : 0, borderBottom: idx < inventory.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13.5px', color: 'text.primary' }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Usage: {item.usage} | {item.stock} {item.unit} in stock
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                                <Chip
                                                    label={status}
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '9px',
                                                        fontWeight: 800,
                                                        color: statusColor,
                                                        bgcolor: statusBg,
                                                        border: 'none'
                                                    }}
                                                />
                                                {(status === 'Critical' || status === 'Low Stock') && (
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        onClick={() => handleRestock(idx)}
                                                        sx={{
                                                            fontSize: '10px',
                                                            p: 0,
                                                            minHeight: 0,
                                                            minWidth: 0,
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            color: 'primary.main',
                                                            '&:hover': { textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        Request Restock
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <div style={{
                                                    height: '6px',
                                                    width: '100%',
                                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${percentage}%`,
                                                        backgroundColor: status === 'Critical' ? '#BA1A1A' : status === 'Low Stock' ? '#FF9800' : '#16A34A',
                                                        borderRadius: '3px',
                                                        transition: 'width 0.4s ease'
                                                    }} />
                                                </div>
                                            </Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: '30px', textAlign: 'right' }}>
                                                {percentage}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Dispense Medication Dialog */}
            <DispenseMedicationDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                dispense={selectedDispense}
                onSuccess={fetchData}
            />
        </Box>
    );
};
