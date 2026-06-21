import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Box, Card, CardContent, Typography, Chip, Button, useMediaQuery, useTheme, Divider
} from '@mui/material';
import { AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { AuditDetailsDialog } from '../dialogs/AuditDetailsDialog';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { exportToCSV } from '../../../shared/utils/csvExport';
import { 
    AdminPageHeader, DataTable, AsyncWrapper 
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS } from '../../../shared/theme.constants';

export const AdminAudits = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams] = useSearchParams();

    const {
        audits,
        users,
        applications,
        loadingStates,
        errorStates,
        refreshAudits: fetchAudits
    } = useAdmin();

    const loading = loadingStates.audits;

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination();
    const tableSort = useTableSort('timestamp', 'desc');
    const detailsDialog = useDialogState();

    const handleExportCSV = () => {
        const headers = ['Status', 'Target Email', 'IP Address', 'Auth Method', 'Security Notes', 'Timestamp'];
        const rows = sortedAudits.map(log => [
            log.success ? 'Success' : 'Failure',
            log.email_attempted,
            log.ip_address || '127.0.0.1',
            log.login_method,
            log.success ? '' : (log.failure_reason || ''),
            log.timestamp
        ]);
        exportToCSV(headers, rows, `security_audits_${new Date().toISOString().split('T')[0]}`);
    };

    // Client-side filtering and sorting
    const sortedAudits = useMemo(() => {
        const filtered = audits.filter((log) => {
            const matchesSearch = 
                log.email_attempted.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.ip_address && log.ip_address.includes(searchQuery)) ||
                (log.failure_reason && log.failure_reason.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'SUCCESS' && log.success) ||
                (statusFilter === 'FAILURE' && !log.success);

            const matchesMethod = methodFilter === 'ALL' || log.login_method === methodFilter;

            return matchesSearch && matchesStatus && matchesMethod;
        });

        return tableSort.sortData(filtered, ['timestamp']);
    }, [audits, searchQuery, statusFilter, methodFilter, tableSort]);

    const paginatedAudits = useMemo(() => pagination.paginate(sortedAudits), [sortedAudits, pagination]);

    const failedAttemptsCount = useMemo(() => audits.filter(log => !log.success).length, [audits]);

    const columns = [
        {
            id: 'status',
            label: 'Status',
            render: (log) => (
                <Box sx={{ display: 'flex', alignItems: 'center', color: log.success ? 'success.main' : 'error.main' }}>
                    {log.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </Box>
            )
        },
        { id: 'email_attempted', label: 'Target Email', sortable: true },
        { id: 'ip_address', label: 'IP Address', render: (log) => log.ip_address || '127.0.0.1' },
        {
            id: 'login_method',
            label: 'Auth Method',
            render: (log) => (
                <Chip 
                    label={log.login_method} 
                    size="small" 
                    variant="outlined" 
                    color={log.login_method === 'GOOGLE' ? 'secondary' : 'default'} 
                    sx={{ fontSize: '9px', fontWeight: 600, borderRadius: '6px', height: 20 }}
                />
            )
        },
        {
            id: 'notes',
            label: 'Security Notes',
            render: (log) => (
                <Typography sx={{ color: log.success ? 'text.secondary' : 'error.main', fontSize: '12.5px', fontWeight: log.success ? 400 : 600, fontFamily: FONTS.BODY }}>
                    {log.success ? '-' : log.failure_reason}
                </Typography>
            )
        },
        {
            id: 'timestamp',
            label: 'Timestamp',
            sortable: true,
            align: 'right',
            render: (log) => (
                <Typography sx={{ color: 'text.secondary', fontSize: '12.5px', fontFamily: FONTS.BODY }}>
                    {formatDateTime(log.timestamp, { includeSeconds: true, hour12: false })}
                </Typography>
            )
        }
    ];

    const mobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedAudits.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                    No security audit events logged in database.
                </Box>
            ) : (
                paginatedAudits.map((log) => (
                    <Card 
                        key={log.id} 
                        onClick={() => detailsDialog.openDialog(log)}
                        sx={{ 
                            p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 1.5, cursor: 'pointer',
                            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,64,67,0.08)' },
                            bgcolor: !log.success ? (theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.08)' : 'rgba(186, 26, 26, 0.025)') : 'inherit',
                            borderLeft: `4px solid ${log.success ? theme.palette.success.main : theme.palette.error.main}`
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ display: 'flex', color: log.success ? 'success.main' : 'error.main' }}>
                                    {log.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '13.5px', wordBreak: 'break-all' }}>
                                    {log.email_attempted}
                                </Typography>
                            </Box>
                            <Chip label={log.login_method} size="small" variant="outlined" color={log.login_method === 'GOOGLE' ? 'secondary' : 'default'} sx={{ fontSize: '9px', fontWeight: 600, height: 18 }} />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>IP Address</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>{log.ip_address || '127.0.0.1'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Timestamp</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '11px' }}>{formatDateTime(log.timestamp, { includeSeconds: true, hour12: false })}</Typography>
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            <AdminPageHeader
                title="Security Audits & Login Trails"
                subtitle="Track all login operations, Google credentials link events, and failed verification attempts."
                onRefresh={fetchAudits}
                loading={loading}
            />

            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '18px' }}>
                                Audit Log Monitoring Feed
                            </Typography>
                            {failedAttemptsCount > 0 && (
                                <Chip label={`${failedAttemptsCount} Warning Failures`} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '9px', fontWeight: 700, borderRadius: '6px' }} />
                            )}
                        </Box>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download size={14} />}
                            onClick={handleExportCSV}
                            disabled={sortedAudits.length === 0}
                            sx={{ 
                                textTransform: 'none', fontWeight: 600, borderRadius: '100px', borderColor: 'divider', color: 'text.primary', fontSize: '12.5px', px: 2,
                                '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }
                            }}
                        >
                            Export to CSV
                        </Button>
                    </Box>

                    <AdminFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                        searchPlaceholder="Search email, IP address, warnings..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Events' },
                            { value: 'SUCCESS', label: 'Success Only' },
                            { value: 'FAILURE', label: 'Failures / Warnings' }
                        ]}
                        filter2Label="Auth Method"
                        filter2Value={methodFilter}
                        onFilter2Change={(val) => { setMethodFilter(val); pagination.resetPage(); }}
                        filter2Options={[
                            { value: 'ALL', label: 'All Methods' },
                            { value: 'PASSWORD', label: 'Password Auth' },
                            { value: 'GOOGLE', label: 'Google Link' }
                        ]}
                    />
                    
                    <AsyncWrapper loading={loading} error={errorStates.audits}>
                        {isMobile ? mobileCards : (
                            <DataTable 
                                columns={columns}
                                data={paginatedAudits}
                                sortState={tableSort}
                                paginationState={{ ...pagination, count: sortedAudits.length }}
                                onRowClick={(log) => detailsDialog.openDialog(log)}
                                emptyMessage="No security audit events logged in database."
                            />
                        )}
                    </AsyncWrapper>
                </CardContent>
            </Card>

            <AuditDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                selectedAudit={detailsDialog.data}
                users={users}
                applications={applications}
            />
        </Box>
    );
};

export default AdminAudits;
