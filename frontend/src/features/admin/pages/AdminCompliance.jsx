import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, IconButton, Chip, Tooltip, Stack, LinearProgress, useTheme
} from '@mui/material';
import {
    Award, ShieldAlert, CheckCircle2, Clock, Edit2, AlertTriangle,
    ShieldCheck, TrendingUp, Users, CalendarClock
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { UpdateDoctorComplianceDialog } from '../dialogs/UpdateDoctorComplianceDialog';
import { AdminFilterBar } from '../components/AdminFilterBar';
import {
    AdminPageHeader, StatCard, StatGrid, DashboardCard, DataTable,
    ToastNotification, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

export const AdminCompliance = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [searchParams] = useSearchParams();

    const {
        compliance = [],
        loadingStates,
        errorStates,
        refreshCompliance
    } = useAdmin();

    const loading = loadingStates.compliance;
    const error = errorStates.compliance;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

    const pagination = usePagination(10);
    const tableSort = useTableSort('doctor_name', 'asc');
    const { toast, showToast, hideToast } = useToast();

    const editDialog = useDialogState();
    const [expiryDate, setExpiryDate] = useState('');
    const [licenseStatus, setLicenseStatus] = useState('ACTIVE');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleEditClick = (doctor) => {
        setExpiryDate(doctor.pmdc_expiry_date || '');
        setLicenseStatus(doctor.license_status || 'ACTIVE');
        setFormError('');
        editDialog.openDialog(doctor);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const doctor = editDialog.data;
        if (!doctor) return;
        setSubmitting(true);
        setFormError('');
        try {
            await adminApi.updateDoctorProfile(doctor.id, {
                pmdc_expiry_date: expiryDate || null,
                license_status: licenseStatus
            });
            showToast('Physician PMDC license updated successfully.', 'success');
            refreshCompliance();
            editDialog.closeDialog();
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Failed to update compliance details.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── KPI metrics ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = compliance.length;
        const active = compliance.filter(d => d.license_status === 'ACTIVE' && (d.days_to_expiry === null || d.days_to_expiry >= 60)).length;
        const pending = compliance.filter(d => d.license_status === 'PENDING_RENEWAL').length;
        const expired = compliance.filter(d => d.license_status === 'EXPIRED' || (d.days_to_expiry !== null && d.days_to_expiry < 0)).length;
        const expiringSoon = compliance.filter(d => d.license_status === 'ACTIVE' && d.days_to_expiry !== null && d.days_to_expiry >= 0 && d.days_to_expiry < 60).length;
        const complianceRate = total > 0 ? Math.round((active / total) * 100) : 0;
        return { total, active, pending, expired, expiringSoon, complianceRate };
    }, [compliance]);

    // ── Alert list: expired + expiring soon, sorted urgency ─────────────
    const alertDoctors = useMemo(() => {
        return [...compliance]
            .filter(d => d.days_to_expiry !== null && d.days_to_expiry < 60)
            .sort((a, b) => a.days_to_expiry - b.days_to_expiry)
            .slice(0, 8);
    }, [compliance]);

    // ── Specialization distribution ──────────────────────────────────────
    const specDistribution = useMemo(() => {
        const map = {};
        compliance.forEach(d => {
            const s = d.specialization || 'Other';
            map[s] = (map[s] || 0) + 1;
        });
        const total = compliance.length || 1;
        return Object.entries(map)
            .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [compliance]);

    // ── Donut segments for compliance health ring ─────────────────────────
    const donutSegments = useMemo(() => {
        const total = stats.total || 1;
        const slices = [
            { label: 'Active',        count: stats.active,       color: COLORS.SUCCESS },
            { label: 'Expiring Soon', count: stats.expiringSoon, color: COLORS.WARNING },
            { label: 'Pending',       count: stats.pending,      color: COLORS.INFO    },
            { label: 'Expired',       count: stats.expired,      color: COLORS.DANGER  },
        ];
        const CIRC = 251.3;
        let accumulated = 0;
        return slices.map(s => {
            const pct = s.count / total;
            const len = (pct * CIRC).toFixed(1);
            const offset = (-(accumulated / total) * CIRC).toFixed(1);
            accumulated += s.count;
            return { ...s, dashArray: `${len} ${CIRC}`, dashOffset: offset };
        });
    }, [stats]);

    // ── Filtered + sorted table data ─────────────────────────────────────
    const processedDoctors = useMemo(() => {
        const filtered = compliance.filter(doc => {
            const nameMatch =
                (doc.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch =
                statusFilter === 'ALL' ||
                (statusFilter === 'EXPIRING_SOON' && doc.days_to_expiry !== null && doc.days_to_expiry >= 0 && doc.days_to_expiry < 60 && doc.license_status === 'ACTIVE') ||
                (statusFilter === 'ALERT' && (doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 60))) ||
                doc.license_status === statusFilter;
            return nameMatch && statusMatch;
        });
        return tableSort.sortData(filtered, ['doctor_name', 'specialization', 'pmdc_expiry_date', 'days_to_expiry']);
    }, [compliance, searchTerm, statusFilter, tableSort]);

    const paginatedDoctors = useMemo(() => pagination.paginate(processedDoctors), [processedDoctors, pagination]);

    // ── Table columns ────────────────────────────────────────────────────
    const columns = [
        {
            id: 'doctor_name',
            label: 'Physician',
            sortable: true,
            render: (doc) => {
                const initials = (doc.doctor_name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
                            bgcolor: isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.08)',
                            color: 'primary.main',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, fontFamily: FONTS.HEADING,
                        }}>
                            {initials}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '13px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                                Dr. {doc.doctor_name}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: FONTS.BODY, fontSize: '11px' }}>
                                {doc.doctor_email}
                            </Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            id: 'specialization',
            label: 'Specialization',
            sortable: true,
            render: (doc) => (
                <Chip
                    label={doc.specialization || 'General'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '11px', fontWeight: 600, height: 22 }}
                />
            )
        },
        {
            id: 'pmdc_expiry_date',
            label: 'PMDC Expiry',
            sortable: true,
            render: (doc) => (
                <Typography sx={{ fontFamily: FONTS.BODY, fontSize: '13px', fontWeight: 600 }}>
                    {doc.pmdc_expiry_date || '—'}
                </Typography>
            )
        },
        {
            id: 'license_status',
            label: 'Status',
            render: (doc) => {
                const isExpired = doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 0);
                const isExpiringSoon = doc.license_status === 'ACTIVE' && doc.days_to_expiry !== null && doc.days_to_expiry >= 0 && doc.days_to_expiry < 60;
                const isPending = doc.license_status === 'PENDING_RENEWAL';
                let color = 'success', label = 'Active';
                if (isExpired)      { color = 'error';   label = 'Expired';         }
                else if (isExpiringSoon) { color = 'warning'; label = 'Expiring Soon'; }
                else if (isPending) { color = 'info';    label = 'Pending Renewal'; }
                return <Chip label={label} size="small" color={color} sx={{ fontWeight: 700, fontSize: '10px', height: 20 }} />;
            }
        },
        {
            id: 'days_to_expiry',
            label: 'Timeline',
            sortable: true,
            render: (doc) => {
                if (doc.days_to_expiry === null) return <Typography variant="body2" color="text.disabled" sx={{ fontFamily: FONTS.BODY }}>N/A</Typography>;
                const days = doc.days_to_expiry;
                const isExpired = days < 0;
                const isUrgent = days >= 0 && days < 14;
                const isWarning = days >= 14 && days < 60;
                const color = isExpired ? 'error.main' : isUrgent ? 'error.main' : isWarning ? 'warning.main' : 'success.main';
                const pct = isExpired ? 0 : Math.min(100, Math.round((days / 365) * 100));
                return (
                    <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                            {(isExpired || isUrgent) && <AlertTriangle size={12} style={{ color: theme.palette.error.main, flexShrink: 0 }} />}
                            {isWarning && <Clock size={12} style={{ color: theme.palette.warning.main, flexShrink: 0 }} />}
                            <Typography sx={{ fontWeight: 700, fontSize: '11.5px', color, fontFamily: FONTS.BODY }}>
                                {isExpired ? `Expired ${Math.abs(days)}d ago` : `${days}d left`}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                                height: 4, borderRadius: 2, bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: isExpired ? 'error.main' : isUrgent ? 'error.main' : isWarning ? 'warning.main' : 'success.main',
                                    borderRadius: 2
                                }
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            id: 'actions',
            label: '',
            align: 'right',
            render: (doc) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Update License Details">
                        <IconButton
                            size="small"
                            onClick={() => handleEditClick(doc)}
                            sx={{
                                border: '1px solid', borderColor: 'divider', borderRadius: '6px',
                                '&:hover': { color: 'primary.main', borderColor: 'primary.light', bgcolor: isDark ? 'rgba(0,106,106,0.08)' : 'rgba(0,106,106,0.05)' }
                            }}
                        >
                            <Edit2 size={13} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    // ── Icon/bg helpers ──────────────────────────────────────────────────
    const neutralBg    = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
    const neutralColor = isDark ? '#9CA3AF' : '#374151';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title="PMDC License Compliance Monitor"
                subtitle="Track physician certifications, Pakistan Medical & Dental Council (PMDC) expiries, and licensing audit status."
                onRefresh={refreshCompliance}
                loading={loading}
                refreshLabel="Sync Registry"
            />

            <AsyncWrapper loading={false} error={error}>
                {/* ── KPI Strip ───────────────────────────────────────── */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Physicians"
                        value={stats.total}
                        description="Registered in directory"
                        icon={Users}
                        iconBg={neutralBg}
                        iconColor={neutralColor}
                        loading={loading}
                    />
                    <StatCard
                        title="Active Licences"
                        value={stats.active}
                        description="Fully compliant & valid"
                        icon={ShieldCheck}
                        iconBg={isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)'}
                        iconColor={COLORS.SUCCESS}
                        loading={loading}
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={stats.expiringSoon}
                        description="Within 60-day threshold"
                        icon={Clock}
                        iconBg={isDark ? 'rgba(255,152,0,0.15)' : 'rgba(255,152,0,0.08)'}
                        iconColor={COLORS.WARNING}
                        loading={loading}
                        chipLabel={stats.expiringSoon > 0 ? 'Attention' : 'Clear'}
                        chipColor={stats.expiringSoon > 0 ? 'warning' : 'default'}
                    />
                    <StatCard
                        title="Expired / Delinquent"
                        value={stats.expired}
                        description="Immediate action required"
                        icon={ShieldAlert}
                        iconBg={isDark ? 'rgba(186,26,26,0.15)' : 'rgba(186,26,26,0.08)'}
                        iconColor={COLORS.DANGER}
                        loading={loading}
                        chipLabel={stats.expired > 0 ? 'ALERT' : 'Clear'}
                        chipColor={stats.expired > 0 ? 'error' : 'default'}
                    />
                </StatGrid>

                {/* ── Two-column insight row ───────────────────────────── */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                    gap: 2,
                    width: '100%',
                    mt: 1,
                }}>
                    {/* Compliance Health Ring */}
                    <DashboardCard
                        title="Compliance Health"
                        subtitle="Overall PMDC licence status breakdown."
                        icon={Award}
                        iconColor={COLORS.PRIMARY}
                        iconBg={isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.08)'}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            {/* SVG Ring */}
                            <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                                <svg width="110" height="110" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent"
                                        stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" />
                                    {donutSegments.map((seg, i) => (
                                        <circle key={i} cx="50" cy="50" r="40" fill="transparent"
                                            stroke={seg.color} strokeWidth="12"
                                            strokeDasharray={seg.dashArray}
                                            strokeDashoffset={seg.dashOffset}
                                            transform="rotate(-90 50 50)"
                                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                                        />
                                    ))}
                                </svg>
                                <Box sx={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%,-50%)', textAlign: 'center'
                                }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '20px', lineHeight: 1, fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                                        {stats.complianceRate}%
                                    </Typography>
                                    <Typography sx={{ fontSize: '9px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                        Compliant
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Legend */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, flex: 1 }}>
                                {[
                                    { label: 'Active',        count: stats.active,       color: COLORS.SUCCESS },
                                    { label: 'Expiring Soon', count: stats.expiringSoon, color: COLORS.WARNING },
                                    { label: 'Pending',       count: stats.pending,      color: COLORS.INFO    },
                                    { label: 'Expired',       count: stats.expired,      color: COLORS.DANGER  },
                                ].map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 800, color: item.color, fontFamily: FONTS.HEADING }}>
                                            {item.count}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </DashboardCard>

                    {/* Specialization Distribution */}
                    <DashboardCard
                        title="Specialization Distribution"
                        subtitle="Physician headcount by clinical specialty."
                        icon={TrendingUp}
                        iconColor={neutralColor}
                        iconBg={neutralBg}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {specDistribution.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3, fontSize: '12px' }}>
                                    No specialization data.
                                </Typography>
                            ) : specDistribution.map((s, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: 'text.primary', fontFamily: FONTS.BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, pr: 1 }}>
                                            {s.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'primary.main', fontFamily: FONTS.HEADING, flexShrink: 0 }}>
                                            {s.count} ({s.pct}%)
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={s.pct}
                                        sx={{
                                            height: 5, borderRadius: 3, bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': { bgcolor: COLORS.PRIMARY, borderRadius: 3 }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </DashboardCard>

                    {/* Urgent Expiry Alert Panel */}
                    <DashboardCard
                        title="Urgent Expiry Alerts"
                        subtitle="Licences expiring within 60 days or already lapsed."
                        icon={CalendarClock}
                        iconColor={alertDoctors.length > 0 ? COLORS.DANGER : COLORS.SUCCESS}
                        iconBg={alertDoctors.length > 0
                            ? (isDark ? 'rgba(186,26,26,0.15)' : 'rgba(186,26,26,0.08)')
                            : (isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)')
                        }
                    >
                        <Box sx={{
                            maxHeight: 220, overflowY: 'auto',
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': { borderRadius: '4px', bgcolor: 'divider' }
                        }}>
                            {alertDoctors.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(22,163,74,0.08)', color: 'success.main', mb: 1 }}>
                                        <CheckCircle2 size={20} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '12px', color: 'text.primary', fontFamily: FONTS.HEADING, display: 'block' }}>
                                        All Licences Valid
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                        No urgent expiries found.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {alertDoctors.map((doc, idx) => {
                                        const days = doc.days_to_expiry;
                                        const isExpired = days < 0;
                                        const isUrgent = days >= 0 && days < 14;
                                        const borderCol = isExpired || isUrgent
                                            ? COLORS.DANGER
                                            : COLORS.WARNING;
                                        const bgCol = isExpired || isUrgent
                                            ? (isDark ? 'rgba(186,26,26,0.06)' : 'rgba(186,26,26,0.025)')
                                            : (isDark ? 'rgba(255,152,0,0.06)' : 'rgba(255,152,0,0.025)');
                                        const chipColor = isExpired || isUrgent ? 'error' : 'warning';
                                        const chipLabel = isExpired ? `${Math.abs(days)}d ago` : `${days}d left`;
                                        const initials = (doc.doctor_name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                        return (
                                            <Box key={doc.id || idx} sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.25,
                                                p: 1, borderRadius: '8px',
                                                border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                                borderLeft: `3px solid ${borderCol}`,
                                                bgcolor: bgCol,
                                            }}>
                                                <Box sx={{
                                                    width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px', fontWeight: 700, fontFamily: FONTS.HEADING, color: 'text.secondary'
                                                }}>
                                                    {initials}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '11.5px', fontFamily: FONTS.HEADING, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        Dr. {doc.doctor_name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                        Expires {doc.pmdc_expiry_date}
                                                    </Typography>
                                                </Box>
                                                <Chip label={chipLabel} size="small" color={chipColor}
                                                    sx={{ height: 18, fontSize: '9px', fontWeight: 700, flexShrink: 0 }} />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>
                </Box>

                {/* ── Compliance Registry Table ────────────────────────── */}
                <Box sx={{ mt: 1 }}>
                    <DashboardCard
                        title="Compliance Registry"
                        subtitle="Full physician PMDC licence audit log with sortable expiry timelines."
                        icon={Award}
                        iconColor={neutralColor}
                        iconBg={neutralBg}
                        action={
                            <Chip
                                label={`${processedDoctors.length} records`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600 }}
                            />
                        }
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <AdminFilterBar
                                searchQuery={searchTerm}
                                onSearchChange={(val) => { setSearchTerm(val); pagination.resetPage(); }}
                                searchPlaceholder="Search physician name or specialization…"
                                filter1Label="Status"
                                filter1Value={statusFilter}
                                onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                                filter1Options={[
                                    { value: 'ALL',              label: 'All Statuses'       },
                                    { value: 'ACTIVE',           label: 'Active'             },
                                    { value: 'EXPIRING_SOON',    label: 'Expiring Soon'      },
                                    { value: 'PENDING_RENEWAL',  label: 'Pending Renewal'    },
                                    { value: 'EXPIRED',          label: 'Expired'            },
                                    { value: 'ALERT',            label: 'Attention Required' },
                                ]}
                            />

                            <DataTable
                                columns={columns}
                                data={paginatedDoctors}
                                sortState={tableSort}
                                paginationState={{ ...pagination, count: processedDoctors.length }}
                                emptyMessage="No physician compliance records found matching your filters."
                            />
                        </Box>
                    </DashboardCard>
                </Box>
            </AsyncWrapper>

            <UpdateDoctorComplianceDialog
                open={editDialog.open}
                onClose={editDialog.closeDialog}
                doctor={editDialog.data}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                licenseStatus={licenseStatus}
                setLicenseStatus={setLicenseStatus}
                submitting={submitting}
                successMessage=""
                formError={formError}
                onSubmit={handleSubmit}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminCompliance;
