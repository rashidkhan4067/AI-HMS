import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Box, Tabs, Tab, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, 
    Typography, Chip, useTheme, Card, Divider, CircularProgress, TablePagination, useMediaQuery
} from '@mui/material';
import { Pill, FlaskConical, Activity, FileText } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { PageHeader } from '../../../shared/components/ui';
import { FilterBar } from '../components/FilterBar';
import { formatPKR as formatCurrency } from '../../../shared/utils/formatUtils';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { usePagination } from '../../../hooks/usePagination';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const DepartmentLogs = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read tab from query string (e.g. ?tab=0), default to 0
    const initialTab = parseInt(searchParams.get('tab') || '0', 10);
    const [activeTab, setActiveTab] = useState(initialTab);

    // States for data
    const [pharmacyLogs, setPharmacyLogs] = useState([]);
    const [labLogs, setLabLogs] = useState([]);
    const [radLogs, setRadLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const pagination = usePagination(10);

    // Sync tab with URL query string
    useEffect(() => {
        const queryTab = parseInt(searchParams.get('tab') || '0', 10);
        if (queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
    }, [searchParams]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSearchParams({ tab: newValue });
        setSearchQuery('');
        setStatusFilter('ALL');
        pagination.resetPage();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pharmacyData, labData, radData] = await Promise.all([
                adminApi.getPharmacyDispenses(),
                adminApi.getDiagnosticOrders({ category: 'LAB' }),
                adminApi.getDiagnosticOrders({ category: 'RADIOLOGY' })
            ]);

            setPharmacyLogs(pharmacyData.results || pharmacyData);
            setLabLogs(labData.results || labData);
            setRadLogs(radData.results || radData);
        } catch (error) {
            console.error("Failed to load department logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Filter & Pagination Logic ---
    const filteredData = useMemo(() => {
        if (activeTab === 0) {
            return pharmacyLogs.filter(item => {
                const matchesSearch = 
                    (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.patient_mrn || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
                return matchesSearch && matchesStatus;
            });
        } else if (activeTab === 1) {
            return labLogs.filter(item => {
                const matchesSearch = 
                    (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.patient_mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.test_name || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
                return matchesSearch && matchesStatus;
            });
        } else {
            return radLogs.filter(item => {
                const matchesSearch = 
                    (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.patient_mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.test_name || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
                return matchesSearch && matchesStatus;
            });
        }
    }, [activeTab, pharmacyLogs, labLogs, radLogs, searchQuery, statusFilter]);

    const paginatedData = useMemo(() => {
        return pagination.paginate(filteredData);
    }, [filteredData, pagination]);

    const statusOptions = [
        { value: 'ALL', label: 'All Statuses' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'DISPENSED', label: 'Dispensed' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ].filter(opt => {
        if (activeTab === 0) return ['ALL', 'PENDING', 'DISPENSED'].includes(opt.value);
        return ['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].includes(opt.value);
    });

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'DISPENSED':
            case 'COMPLETED':
                return 'success';
            case 'PENDING':
                return 'info';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 4 } }}>
            <PageHeader
                title="Clinical Operations Audit Trail"
                subtitle="Read-only ledger of prescriptions, diagnostics, and lab tests for administrative oversight and compliance tracking."
                onRefresh={fetchData}
                loading={loading}
                refreshLabel="Refresh Logs"
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: { xs: 0, md: -1 }, mb: 1 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                            height: 3,
                            borderRadius: '3px',
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: FONTS.HEADING,
                            fontSize: { xs: '12px', md: '14px' },
                            color: 'text.secondary',
                            pb: 1.5,
                            '&.Mui-selected': {
                                color: 'primary.main',
                            },
                        }
                    }}
                >
                    <Tab icon={<Pill size={16} style={{ marginRight: 6 }} />} iconPosition="start" label="Pharmacy Dispenses" />
                    <Tab icon={<FlaskConical size={16} style={{ marginRight: 6 }} />} iconPosition="start" label="Laboratory Orders" />
                    <Tab icon={<Activity size={16} style={{ marginRight: 6 }} />} iconPosition="start" label="Radiology Scans" />
                </Tabs>
            </Box>

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={activeTab === 0 ? "Search by Patient Name or MRN..." : "Search by Patient Name, MRN or Test..."}
                filter1Label="Status"
                filter1Value={statusFilter}
                onFilter1Change={setStatusFilter}
                filter1Options={statusOptions}
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={36} color="primary" />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {isMobile ? (
                        paginatedData.length === 0 ? (
                            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', py: 6, px: 2, textAlign: 'center', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                No transaction or operational logs found matching filters.
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {paginatedData.map((item, idx) => {
                                    const shortId = item.id.substring(0, 8).toUpperCase() + '...';
                                    
                                    if (activeTab === 0) {
                                        const patientName = item.patient_name || 'N/A';
                                        const mrn = item.patient_mrn || 'N/A';
                                        const docName = item.doctor_name || 'N/A';
                                        
                                        return (
                                            <Card key={item.id || idx} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#FBFBFB' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                                                        ID: {shortId}
                                                    </Typography>
                                                    <Chip label={item.status} size="small" color={getStatusChipColor(item.status)} sx={{ fontWeight: 700, fontSize: '9px', height: 18 }} />
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Patient</Typography>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.BODY }}>{patientName}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10.5px', fontFamily: FONTS.BODY }}>{mrn}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Prescribing Doctor</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.BODY }}>{docName}</Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Amount</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px', color: 'primary.main', fontFamily: FONTS.HEADING }}>{formatCurrency(item.amount)}</Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Dispensed Time</Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', fontFamily: FONTS.BODY }}>
                                                            {item.dispensed_at ? formatDateTime(item.dispensed_at) : '—'}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Dispensed By</Typography>
                                                        <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                            {item.dispensed_by_name || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        );
                                    } else {
                                        const patientName = item.patient_name || 'N/A';
                                        const mrn = item.patient_mrn || 'N/A';
                                        const docName = item.doctor_name || 'N/A';
                                        
                                        return (
                                            <Card key={item.id || idx} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#FBFBFB' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                                                        ID: {shortId}
                                                    </Typography>
                                                    <Chip label={item.status} size="small" color={getStatusChipColor(item.status)} sx={{ fontWeight: 700, fontSize: '9px', height: 18 }} />
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Patient</Typography>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.BODY }}>{patientName}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10.5px', fontFamily: FONTS.BODY }}>{mrn}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Ordering Doctor</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.BODY }}>{docName}</Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Test/Scan Name</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.BODY }}>{item.test_name}</Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Ordered At</Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', fontFamily: FONTS.BODY }}>
                                                            {formatDateTime(item.created_at)}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: FONTS.BODY }}>Result Summary</Typography>
                                                        <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', fontFamily: FONTS.BODY, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.result?.result_summary || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        );
                                    }
                                })}
                            </Box>
                        )
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        {activeTab === 0 ? (
                                            <>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Order ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Patient Name (MRN)</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Prescribing Doctor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Dispensed Time</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Dispensed By</TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Order ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Patient Name (MRN)</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Ordering Doctor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Test/Scan Name</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Ordered At</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Result Summary</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                No transaction or operational logs found matching filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, idx) => {
                                            const shortId = item.id.substring(0, 8).toUpperCase() + '...';
                                            
                                            if (activeTab === 0) {
                                                const patientName = item.patient_name || 'N/A';
                                                const mrn = item.patient_mrn || 'N/A';
                                                const docName = item.doctor_name || 'N/A';
                                                
                                                return (
                                                    <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ fontFamily: 'monospace', py: 1.25 }}>{shortId}</TableCell>
                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>{patientName}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10.5px' }}>{mrn}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, fontSize: '12.5px' }}>{docName}</TableCell>
                                                        <TableCell sx={{ py: 1.25, fontWeight: 700, fontSize: '12.5px' }}>{formatCurrency(item.amount)}</TableCell>
                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Chip label={item.status} size="small" color={getStatusChipColor(item.status)} sx={{ fontWeight: 700, fontSize: '9.5px', height: 18 }} />
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, color: 'text.secondary', fontSize: '11px' }}>
                                                            {item.dispensed_at ? formatDateTime(item.dispensed_at) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, fontSize: '12.5px', color: 'text.secondary' }}>
                                                            {item.dispensed_by_name || '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            } else {
                                                const patientName = item.patient_name || 'N/A';
                                                const mrn = item.patient_mrn || 'N/A';
                                                const docName = item.doctor_name || 'N/A';
                                                
                                                return (
                                                    <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ fontFamily: 'monospace', py: 1.25 }}>{shortId}</TableCell>
                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>{patientName}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10.5px' }}>{mrn}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, fontSize: '12.5px' }}>{docName}</TableCell>
                                                        <TableCell sx={{ py: 1.25, fontWeight: 600, fontSize: '12.5px' }}>{item.test_name}</TableCell>
                                                        <TableCell sx={{ py: 1.25 }}>
                                                            <Chip label={item.status} size="small" color={getStatusChipColor(item.status)} sx={{ fontWeight: 700, fontSize: '9.5px', height: 18 }} />
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, color: 'text.secondary', fontSize: '11px' }}>
                                                            {formatDateTime(item.created_at)}
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.25, fontSize: '12px', color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.result?.result_summary || '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {filteredData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={pagination.rowsPerPage}
                            page={pagination.page}
                            onPageChange={pagination.handleChangePage}
                            onRowsPerPageChange={pagination.handleChangeRowsPerPage}
                            sx={{ borderTop: 'none', mt: 1 }}
                        />
                    )}
                </Box>
            )}
        </Box>
    );
};

export default DepartmentLogs;
