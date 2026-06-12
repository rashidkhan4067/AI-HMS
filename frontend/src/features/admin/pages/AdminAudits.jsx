import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, Typography, Card, CardContent, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Alert, Skeleton, TablePagination, TableSortLabel, Button,
    useMediaQuery, useTheme, Divider
} from '@mui/material';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { AuditDetailsDialog } from '../dialogs/AuditDetailsDialog';

export const AdminAudits = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        audits,
        users,
        applications,
        loadingStates,
        errorStates,
        refreshAudits: fetchAudits
    } = useAdmin();

    const loading = loadingStates.audits;
    const error = errorStates.audits;

    // Filter, Search, Sort & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('desc');

    // Details Modal State
    const [selectedAudit, setSelectedAudit] = useState(null);

    const showToast = useCallback((msg, severity = 'error') => {
        // Handled via errorStates in context
    }, []);



    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    // Sorting columns logic
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Client-side filtering, searching, and sorting memoized for performance
    const sortedAudits = useMemo(() => {
        const filtered = audits.filter((log) => {
            // Search filter
            const matchesSearch = 
                log.email_attempted.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.ip_address && log.ip_address.includes(searchQuery)) ||
                (log.failure_reason && log.failure_reason.toLowerCase().includes(searchQuery.toLowerCase()));

            // Status filter
            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'SUCCESS' && log.success) ||
                (statusFilter === 'FAILURE' && !log.success);

            // Method filter
            const matchesMethod = methodFilter === 'ALL' || log.login_method === methodFilter;

            return matchesSearch && matchesStatus && matchesMethod;
        });

        return [...filtered].sort((a, b) => {
            let valA = a[orderBy] || '';
            let valB = b[orderBy] || '';

            if (orderBy === 'timestamp') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            if (typeof valA === 'string') {
                return order === 'asc' 
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return order === 'asc'
                    ? valA - valB
                    : valB - valA;
            }
        });
    }, [audits, searchQuery, statusFilter, methodFilter, orderBy, order]);

    const paginatedAudits = useMemo(() => {
        return sortedAudits.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedAudits, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Counter helpers
    const failedAttemptsCount = useMemo(() => {
        return audits.filter(log => !log.success).length;
    }, [audits]);

    // Mobile Adaptive Card Layout
    const mobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedAudits.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    No security audit events logged in database.
                </Box>
            ) : (
                paginatedAudits.map((log) => (
                    <Card 
                        key={log.id} 
                        onClick={() => setSelectedAudit(log)}
                        sx={{ 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1.5,
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                                    : '0 4px 12px rgba(60,64,67,0.08)'
                            },
                            bgcolor: !log.success ? (theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.08)' : 'rgba(186, 26, 26, 0.025)') : 'inherit',
                            borderLeft: `4px solid ${log.success ? theme.palette.success.main : theme.palette.error.main}`
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ display: 'flex', color: log.success ? 'success.main' : 'error.main' }}>
                                    {log.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '13.5px', wordBreak: 'break-all' }}>
                                    {log.email_attempted}
                                </Typography>
                            </Box>
                            <Chip 
                                label={log.login_method} 
                                size="small" 
                                variant="outlined" 
                                color={log.login_method === 'GOOGLE' ? 'secondary' : 'default'} 
                                sx={{ fontSize: '9px', fontWeight: 600, height: 18 }}
                            />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>IP Address</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>{log.ip_address || '127.0.0.1'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Timestamp</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '11px' }}>{formatDateTime(log.timestamp)}</Typography>
                            </Box>
                            {!log.success && (
                                <Box sx={{ mt: 0.5, p: 1, bgcolor: 'rgba(186, 26, 26, 0.05)', borderRadius: '6px' }}>
                                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
                                        Reason: {log.failure_reason}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Card>
                ))
            )}
        </Box>
    );

    // Desktop High-Density Table Layout
    const desktopTable = (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'email_attempted'}
                                direction={orderBy === 'email_attempted' ? order : 'asc'}
                                onClick={() => handleRequestSort('email_attempted')}
                            >
                                Target Email
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Auth Method</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Security Notes</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }} align="right">
                            <TableSortLabel
                                active={orderBy === 'timestamp'}
                                direction={orderBy === 'timestamp' ? order : 'asc'}
                                onClick={() => handleRequestSort('timestamp')}
                            >
                                Timestamp
                            </TableSortLabel>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedAudits.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                                No security audit events logged in database.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedAudits.map((log) => (
                            <TableRow 
                                key={log.id} 
                                hover
                                onClick={() => setSelectedAudit(log)}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: !log.success ? (theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.04)' : 'rgba(186, 26, 26, 0.015)') : 'inherit',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: !log.success ? (theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.1)' : 'rgba(186, 26, 26, 0.04)') : 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ py: 1.2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: log.success ? 'success.main' : 'error.main' }}>
                                        {log.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{log.email_attempted}</TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{log.ip_address || '127.0.0.1'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={log.login_method} 
                                        size="small" 
                                        variant="outlined" 
                                        color={log.login_method === 'GOOGLE' ? 'secondary' : 'default'} 
                                        sx={{ fontSize: '9px', fontWeight: 600, borderRadius: '6px', height: 20 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: log.success ? 'text.secondary' : 'error.main', fontSize: '12.5px', fontWeight: log.success ? 400 : 600, fontFamily: "'DM Sans', sans-serif" }}>
                                    {log.success ? '-' : log.failure_reason}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '12.5px', fontFamily: "'DM Sans', sans-serif" }}>
                                    {formatDateTime(log.timestamp)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, fontFamily: "'Outfit', sans-serif", fontSize: { xs: '1.65rem', sm: '2rem' } }}>
                    Security Audits & Login Trails
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    Track all login operations, Google credentials link events, and failed verification attempts.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                    {error}
                </Alert>
            )}

            {/* Audits Card */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                Audit Log Monitoring Feed
                            </Typography>
                            {failedAttemptsCount > 0 && (
                                <Chip 
                                    label={`${failedAttemptsCount} Warning Failures`} 
                                    size="small" 
                                    color="error" 
                                    variant="outlined" 
                                    sx={{ height: 20, fontSize: '9px', fontWeight: 700, borderRadius: '6px' }}
                                />
                            )}
                        </Box>
                        <Button
                            size="small"
                            startIcon={<RefreshCw size={14} />}
                            onClick={fetchAudits}
                            sx={{ 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                borderRadius: '100px',
                                borderColor: 'divider',
                                color: 'text.primary',
                                fontSize: '12.5px',
                                px: 2,
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            Reload Logs
                        </Button>
                    </Box>

                    {/* Search & Filter Controls */}
                    <AdminFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
                        searchPlaceholder="Search email, IP address, warnings..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); setPage(0); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Events' },
                            { value: 'SUCCESS', label: 'Success Only' },
                            { value: 'FAILURE', label: 'Failures / Warnings' }
                        ]}
                        filter2Label="Auth Method"
                        filter2Value={methodFilter}
                        onFilter2Change={(val) => { setMethodFilter(val); setPage(0); }}
                        filter2Options={[
                            { value: 'ALL', label: 'All Methods' },
                            { value: 'PASSWORD', label: 'Password Auth' },
                            { value: 'GOOGLE', label: 'Google Link' }
                        ]}
                    />
                    
                    {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: '12px' }} />
                    ) : (
                        <>
                            {isMobile ? mobileCards : desktopTable}
                            
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={sortedAudits.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: 'none', mt: 1 }}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Advanced Audit Log Details Dialog */}
            <AuditDetailsDialog
                open={!!selectedAudit}
                onClose={() => setSelectedAudit(null)}
                selectedAudit={selectedAudit}
                users={users}
                applications={applications}
            />
        </Box>
    );
};

export default AdminAudits;
