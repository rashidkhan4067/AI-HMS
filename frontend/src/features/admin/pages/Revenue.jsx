import { useMemo, useState, useEffect } from 'react';
import { 
    Box, Typography, LinearProgress, useTheme, Chip, Tabs, Tab, useMediaQuery, Card, Divider,
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, TablePagination
} from '@mui/material';
import { 
    TrendingUp, ShieldCheck, DollarSign, Wallet, ShoppingCart, Award, Coins, AlertTriangle, Clock, FileText
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { formatPKR as formatCurrency } from '../../../shared/utils/formatUtils';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { 
    PageHeader, StatCard, DashboardCard, StatGrid, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const Revenue = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);

    const { 
        revenue,
        billingOversight,
        loadingStates,
        errorStates,
        refreshRevenue,
        refreshBillingOversight
    } = useAdmin();

    const loading = loadingStates.revenue || loadingStates.billingOversight;
    const error = errorStates.revenue || errorStates.billingOversight;

    useEffect(() => {
        refreshRevenue();
        refreshBillingOversight();
    }, [refreshRevenue, refreshBillingOversight]);

    const handleSyncAll = async () => {
        if (activeTab === 0) {
            await refreshBillingOversight();
        } else {
            await refreshRevenue();
        }
    };

    // ── TAB 1 (Tax Reconciliation) Data ─────────────────────────────────
    const totalCollectedFBR = useMemo(() => {
        if (!revenue?.billing_reconciliation) return 0;
        return revenue.billing_reconciliation.reduce((acc, curr) => acc + parseFloat(curr.total_collected), 0);
    }, [revenue]);

    const paymentMethodsFBR = useMemo(() => {
        if (!revenue?.billing_reconciliation) return [];
        return revenue.billing_reconciliation.map(item => {
            const methodLabelMap = {
                'CASH': 'Cash Payments',
                'CARD': 'Credit/Debit Card',
                'MOBILE_PAY': 'Digital Online Transfer',
                'INSURANCE': 'Insurance Claims',
            };
            const amount = parseFloat(item.total_collected);
            const percentage = totalCollectedFBR > 0 ? Math.round((amount / totalCollectedFBR) * 100) : 0;
            return {
                method: item.payment_method,
                label: methodLabelMap[item.payment_method] || item.payment_method,
                amount,
                count: item.transaction_count,
                percentage
            };
        });
    }, [revenue, totalCollectedFBR]);

    const doctorConsultations = revenue?.doctor_consultations || { gross_amount: 0, withholding_tax_deducted: 0, net_payout: 0, count: 0 };
    const pharmacySales = revenue?.pharmacy_sales || { total_amount: 0, total_dispensed: 0 };

    // ── TAB 2 (Billing & Oversight) Data ────────────────────────────────
    const aggregates = billingOversight?.aggregates || { total_collected: 0, patient_receivables: 0, insurance_receivables: 0, total_overdue: 0, overdue_count: 0 };
    const overdueAlerts = billingOversight?.overdue_alerts || [];
    const ledger = billingOversight?.ledger || [];
    const dailyCollections = billingOversight?.daily_collections || [];

    const isDark = theme.palette.mode === 'dark';
    const neutralIconBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB';
    const neutralIconColor = isDark ? '#9CA3AF' : '#374151';

    const isOverdueAlert = (aggregates.overdue_count || 0) > 0;
    const overdueIconBg = isOverdueAlert ? (isDark ? 'rgba(186,26,26,0.15)' : '#FEF2F2') : neutralIconBg;
    const overdueIconColor = isOverdueAlert ? (isDark ? '#FF8787' : '#DC2626') : neutralIconColor;

    const hasOverdueAlerts = overdueAlerts.length > 0;
    const alertListIconBg = hasOverdueAlerts ? (isDark ? 'rgba(186,26,26,0.15)' : '#FEF2F2') : neutralIconBg;
    const alertListIconColor = hasOverdueAlerts ? (isDark ? '#FF8787' : '#DC2626') : neutralIconColor;

    const channelSplits = useMemo(() => {
        if (!billingOversight?.channel_splits) return [];
        const total = billingOversight.channel_splits.reduce((acc, curr) => acc + curr.total, 0);
        return billingOversight.channel_splits.map(item => {
            const labelMap = {
                'CASH': 'Cash Register',
                'CARD': 'POS Card Terminal',
                'MOBILE_PAY': 'Mobile Wallet (JazzCash/Easypaisa)',
                'INSURANCE': 'Insurance Panel Claims',
                'MIXED': 'Mixed Payment Split'
            };
            return {
                ...item,
                label: labelMap[item.payment_method] || item.payment_method,
                percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
            };
        });
    }, [billingOversight]);

    const insurancePanel = useMemo(() => {
        if (!billingOversight?.insurance_panel) return [];
        const total = billingOversight.insurance_panel.reduce((acc, curr) => acc + curr.total, 0);
        return billingOversight.insurance_panel.map(item => {
            const labelMap = {
                'SEHAT_CARD': 'Sehat Sahulat Card',
                'STATE_LIFE': 'State Life Insurance',
                'JUBILEE': 'Jubilee Life Insurance',
                'EFU': 'EFU General Insurance',
                'ASKARI': 'Askari General Insurance',
                'TPL': 'TPL Insurance',
                'OTHER': 'Other Panel'
            };
            return {
                ...item,
                label: labelMap[item.insurance_provider] || item.insurance_provider,
                percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
            };
        });
    }, [billingOversight]);

    const maxDailyCollection = useMemo(() => {
        if (dailyCollections.length === 0) return 1;
        return Math.max(...dailyCollections.map(d => d.total), 1);
    }, [dailyCollections]);

    const ledgerPagination = usePagination();
    const paginatedLedger = useMemo(() => ledgerPagination.paginate(ledger), [ledger, ledgerPagination]);

    // ── Column / Table Definitions ───────────────────────────────────────
    const fbrTableData = [
        { id: 1, category: 'Gross Medical Consults', total: formatCurrency(doctorConsultations.gross_amount) },
        { id: 2, category: 'Withholding Tax Liability', total: <Typography sx={{ color: 'error.main', fontWeight: 600 }}>-{formatCurrency(doctorConsultations.withholding_tax_deducted)}</Typography> },
        { id: 3, category: <Typography sx={{ fontWeight: 700 }}>Total Net Doctors Ledger</Typography>, total: <Typography sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(doctorConsultations.net_payout)}</Typography> }
    ];

    const ledgerColumns = [
        { id: 'id', label: 'Invoice ID', render: (inv) => <Typography sx={{ fontFamily: 'monospace', fontSize: '11px' }}>{inv.id.substring(0, 8).toUpperCase()}...</Typography> },
        { id: 'patient_name', label: 'Patient Name', render: (inv) => <Typography sx={{ fontWeight: 600 }}>{inv.patient_name}</Typography> },
        { id: 'patient_mrn', label: 'MRN', render: (inv) => <Typography sx={{ fontFamily: 'monospace' }}>{inv.patient_mrn}</Typography> },
        { id: 'doctor_name', label: 'Physician', render: (inv) => {
            if (!inv.doctor_name) return '';
            return inv.doctor_name.startsWith('Dr. ') ? inv.doctor_name : (inv.doctor_name.startsWith('Dr.') ? inv.doctor_name.replace('Dr.', 'Dr. ') : `Dr. ${inv.doctor_name}`);
        } },
        { id: 'amount', label: 'Total Amount', render: (inv) => <Typography sx={{ fontWeight: 700 }}>{formatCurrency(inv.amount)}</Typography> },
        { id: 'paid_amount', label: 'Cash/Card Paid', render: (inv) => <Typography sx={{ color: 'success.main' }}>{formatCurrency(inv.paid_amount)}</Typography> },
        { id: 'insurance_amount', label: 'Panel Cover', render: (inv) => <Typography sx={{ color: 'info.main' }}>{formatCurrency(inv.insurance_amount)}</Typography> },
        {
            id: 'payment_status',
            label: 'Status',
            render: (inv) => {
                let color = 'default';
                if (inv.payment_status === 'PAID') color = 'success';
                if (inv.payment_status === 'PARTIALLY_PAID') color = 'warning';
                if (inv.payment_status === 'PENDING') color = 'info';
                return <Chip label={inv.payment_status} size="small" color={color} sx={{ fontWeight: 700, fontSize: '9px', height: 18 }} />;
            }
        },
        { id: 'created_at', label: 'Timestamp', render: (inv) => <Typography sx={{ color: 'text.secondary', fontSize: '11px' }}>{formatDateTime(inv.created_at)}</Typography> }
    ];

    // ── Color helpers ────────────────────────────────────────────────────
    const getPaymentMethodColor = (method) => {
        switch (method) {
            case 'CASH': return COLORS.SUCCESS;
            case 'CARD': return COLORS.INFO;
            case 'MOBILE_PAY': return COLORS.ACCENT;
            case 'INSURANCE': return COLORS.ADMIN_PURPLE || '#9C27B0';
            default: return COLORS.PRIMARY;
        }
    };

    const getInsuranceColor = (provider) => {
        switch (provider) {
            case 'SEHAT_CARD': return COLORS.SUCCESS;
            case 'STATE_LIFE': return COLORS.INFO;
            case 'JUBILEE': return COLORS.ADMIN_PURPLE || '#9C27B0';
            case 'EFU': return COLORS.DANGER;
            case 'ASKARI': return COLORS.AMBER || '#7D5700';
            case 'TPL': return COLORS.PRIMARY;
            default: return COLORS.TEAL_GREY;
        }
    };

    // ── Tab renderers ────────────────────────────────────────────────────
    const fbrMobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fbrTableData.map((row, idx) => (
                <Card key={idx} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                            {row.category}
                        </Typography>
                        <Box>{row.total}</Box>
                    </Box>
                </Card>
            ))}
        </Box>
    );

    const renderFBRTaxReconciliation = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <StatGrid cols={4}>
                <StatCard title="Gross Consultation Fees" value={formatCurrency(doctorConsultations.gross_amount)} description={`${doctorConsultations.count} Physician visits billed`} icon={DollarSign} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} chipLabel="Today" />
                <StatCard title="FBR Withholding Tax (10%)" value={formatCurrency(doctorConsultations.withholding_tax_deducted)} description="Fitted standard withholding" icon={ShieldCheck} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} chipLabel="Today" />
                <StatCard title="Net Doctor Payouts" value={formatCurrency(doctorConsultations.net_payout)} description="Professional fees after FBR tax" icon={Wallet} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} chipLabel="Today" />
                <StatCard title="Pharmacy Dispensations" value={formatCurrency(pharmacySales.total_amount)} description={`${pharmacySales.total_dispensed} Prescription orders`} icon={ShoppingCart} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} chipLabel="Today" />
            </StatGrid>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2.5,
                alignItems: 'stretch',
                width: '100%',
            }}>
                {/* LEFT: Collection Channels Reconciliation */}
                <DashboardCard title="Collection Channels Reconciliation" subtitle="Cash collections reconciled against POS card terminal, registers and digital transfers." icon={Coins} iconColor={neutralIconColor} iconBg={neutralIconBg}>
                    {paymentMethodsFBR.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>No transaction records registered today.</Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%' }}>
                            {paymentMethodsFBR.map((method, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '13px', color: 'text.primary' }}>{method.label}</Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>{method.count} transaction receipts logged</Typography>
                                        </Box>
                                        <Typography sx={{ fontWeight: 700, color: getPaymentMethodColor(method.method), fontFamily: FONTS.HEADING, fontSize: '13px' }}>
                                            {formatCurrency(method.amount)} <span style={{ fontSize: '11px', fontWeight: 500, color: theme.palette.text.secondary }}>({method.percentage}%)</span>
                                        </Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={method.percentage} sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', '& .MuiLinearProgress-bar': { bgcolor: getPaymentMethodColor(method.method), borderRadius: 3 } }} />
                                </Box>
                            ))}
                            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                <Typography sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '14px', color: 'text.primary' }}>Total Reconciled Collections</Typography>
                                <Typography sx={{ fontWeight: 800, fontFamily: FONTS.HEADING, color: 'success.main', fontSize: '1.25rem' }}>{formatCurrency(totalCollectedFBR)}</Typography>
                            </Box>
                        </Box>
                    )}
                </DashboardCard>

                {/* RIGHT: FBR Tax Auditor Details */}
                <DashboardCard title="FBR Tax Auditor Details" subtitle="Regulatory compliance audits" icon={TrendingUp} iconColor={neutralIconColor} iconBg={neutralIconBg}>
                    <Box sx={{ bgcolor: isDark ? 'rgba(0,106,106,0.08)' : 'rgba(0,106,106,0.025)', p: 2, borderRadius: '8px', border: '1px solid', borderColor: isDark ? 'rgba(0,106,106,0.3)' : 'rgba(0,106,106,0.15)', borderLeft: '4px solid', borderLeftColor: COLORS.PRIMARY, mb: 2.5 }}>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Standard Withholding Tax Rules:</Typography>
                        <Typography sx={{ color: 'text.primary', fontWeight: 700, mb: 0.5, lineHeight: 1.4, fontSize: '13px', fontFamily: FONTS.HEADING }}>Section 153(1)(b) — Income Tax Ordinance</Typography>
                        <Typography sx={{ display: 'block', lineHeight: 1.4, fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>Professional fees paid to doctors are subject to a standard 10% withholding tax for active tax filers. This dashboard calculates fitment thresholds and aggregates net doctor payout obligations dynamically.</Typography>
                    </Box>
                    {isMobile ? fbrMobileCards : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Ledger Category</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>Calculated Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fbrTableData.map((row) => (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontFamily: FONTS.BODY, py: 1.5 }}>{row.category}</TableCell>
                                            <TableCell align="right" sx={{ fontFamily: FONTS.BODY, py: 1.5 }}>{row.total}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontFamily: FONTS.BODY }}>Ledger report generated automatically at {revenue?.date_generated || new Date().toISOString().split('T')[0]}. All transactions subject to audit logging.</Typography>
                    </Box>
                </DashboardCard>
            </Box>
        </Box>
    );

    const ledgerMobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedLedger.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                    No transaction records found.
                </Box>
            ) : (
                paginatedLedger.map((inv) => {
                    let color = 'default';
                    if (inv.payment_status === 'PAID') color = 'success';
                    if (inv.payment_status === 'PARTIALLY_PAID') color = 'warning';
                    if (inv.payment_status === 'PENDING') color = 'info';

                    return (
                        <Card 
                            key={inv.id} 
                            sx={{ 
                                p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 1.5,
                                transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,64,67,0.08)' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '13px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                                        {inv.patient_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: FONTS.BODY, fontSize: '11px' }}>
                                        MRN: {inv.patient_mrn}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: FONTS.BODY, fontSize: '11px', mt: 0.5 }}>
                                        {inv.doctor_name ? (inv.doctor_name.startsWith('Dr. ') ? inv.doctor_name : (inv.doctor_name.startsWith('Dr.') ? inv.doctor_name.replace('Dr.', 'Dr. ') : `Dr. ${inv.doctor_name}`)) : ''}
                                    </Typography>
                                </Box>
                                <Chip label={inv.payment_status} size="small" color={color} sx={{ fontWeight: 700, fontSize: '9px', height: 18 }} />
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Amount</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(inv.amount)}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Paid</Typography>
                                    <Typography sx={{ color: 'success.main', fontWeight: 600 }}>{formatCurrency(inv.paid_amount)}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Panel</Typography>
                                    <Typography sx={{ color: 'info.main', fontWeight: 600 }}>{formatCurrency(inv.insurance_amount)}</Typography>
                                </Box>
                            </Box>
                        </Card>
                    );
                })
            )}
        </Box>
    );

    const renderBillingOversight = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* KPI row */}
            <StatGrid cols={4}>
                <StatCard title="Total Collections" value={formatCurrency(aggregates.total_collected)} description="Total cash/card/mobile collected" icon={Coins} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} />
                <StatCard title="Patient Receivables" value={formatCurrency(aggregates.patient_receivables)} description="Remaining unpaid patient balance" icon={FileText} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} />
                <StatCard title="Pending Panel Claims" value={formatCurrency(aggregates.insurance_receivables)} description="Awaiting insurance reimbursement" icon={Award} iconBg={neutralIconBg} iconColor={neutralIconColor} loading={loading} />
                <StatCard title="Overdue Balance" value={formatCurrency(aggregates.total_overdue)} description={`${aggregates.overdue_count} overdue invoice alerts`} icon={AlertTriangle} iconBg={overdueIconBg} iconColor={overdueIconColor} loading={loading} chipLabel={aggregates.overdue_count > 0 ? 'ALERT' : 'Oversight'} chipColor={aggregates.overdue_count > 0 ? 'error' : 'default'} />
            </StatGrid>

            {/* ── CSS-grid two-column layout: fluid main + fixed 380px sidebar ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
                gap: 2.5,
                alignItems: 'start',
                width: '100%',
            }}>
                {/* LEFT — chart on top, ledger below */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
                    {/* Collections Trend Chart */}
                    <DashboardCard
                        title="Collections Trend (Last 30 Days)"
                        subtitle="Daily cash collections reconciled against POS register and terminal totals."
                        icon={Clock}
                        iconColor={neutralIconColor}
                        iconBg={neutralIconBg}
                    >
                        <Box sx={{
                            height: dailyCollections.length < 3 ? '140px' : '260px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: dailyCollections.length < 3 ? 'center' : 'flex-end',
                            width: '100%',
                            position: 'relative',
                            pt: dailyCollections.length < 3 ? 0 : 2,
                        }}>
                            {dailyCollections.length < 3 ? (
                                <Box sx={{
                                    py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', width: '100%', border: '1px dashed',
                                    borderColor: 'divider', borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                    textAlign: 'center', color: 'text.secondary'
                                }}>
                                    <Clock size={22} style={{ marginBottom: '8px', opacity: 0.6 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary', mb: 0.5 }}>Not enough data yet</Typography>
                                    <Typography sx={{ fontSize: '11px', px: 3 }}>
                                        Requires at least 3 days of historical transaction logs.
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {/* horizontal gridlines */}
                                    <Box sx={{
                                        position: 'absolute', top: 16, left: 0, right: 0, bottom: 24,
                                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                        pointerEvents: 'none', opacity: 0.1, zIndex: 0
                                    }}>
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <Box key={i} sx={{ width: '100%', borderTop: '1px solid', borderColor: isDark ? '#FFF' : '#000' }} />
                                        ))}
                                    </Box>
                                    {/* bars */}
                                    <Box sx={{
                                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                                        height: '100%', pt: 2, pb: 1, gap: '3px', zIndex: 1, position: 'relative'
                                    }}>
                                        {dailyCollections.slice(-20).map((d, index) => {
                                            const heightPercent = Math.max(8, Math.round((d.total / maxDailyCollection) * 100));
                                            return (
                                                <Box key={index} sx={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    flex: 1, height: '100%', justifyContent: 'flex-end'
                                                }}>
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            height: `${heightPercent}%`,
                                                            background: `linear-gradient(180deg, ${COLORS.ACCENT} 0%, ${COLORS.PRIMARY} 100%)`,
                                                            borderRadius: '4px 4px 0 0',
                                                            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                filter: 'brightness(1.2)',
                                                                transform: 'scaleY(1.04)',
                                                                boxShadow: isDark
                                                                    ? '0 4px 14px rgba(0,106,106,0.45)'
                                                                    : '0 4px 14px rgba(0,106,106,0.22)',
                                                            },
                                                        }}
                                                        title={`${d.date}\n${formatCurrency(d.total)} · ${d.count} receipts`}
                                                    />
                                                    <Typography variant="caption" sx={{
                                                        fontSize: '9px', mt: 0.5, color: 'text.secondary',
                                                        whiteSpace: 'nowrap',
                                                        visibility: index % 4 === 0 ? 'visible' : 'hidden'
                                                    }}>
                                                        {d.date.substring(5)}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </DashboardCard>

                    {/* Daily Transaction Ledger */}
                    <DashboardCard
                        title="Daily Transaction Ledger (Clinical-Blind)"
                        subtitle="Reconciled transaction logs. Clinical descriptions and diagnoses are omitted per data regulations."
                        icon={FileText}
                        iconColor={neutralIconColor}
                        iconBg={neutralIconBg}
                    >
                        {isMobile ? ledgerMobileCards : (
                            <>
                                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                                {ledgerColumns.map((col) => (
                                                    <TableCell key={col.id} sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, py: 1.5 }}>
                                                        {col.label}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedLedger.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={ledgerColumns.length} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                        No transaction records found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedLedger.map((inv, idx) => (
                                                    <TableRow key={inv.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        {ledgerColumns.map((col) => (
                                                            <TableCell key={col.id} sx={{ fontFamily: FONTS.BODY, py: 1.25 }}>
                                                                {col.render ? col.render(inv) : inv[col.id]}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {ledger.length > 0 && (
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={ledger.length}
                                        rowsPerPage={ledgerPagination.rowsPerPage}
                                        page={ledgerPagination.page}
                                        onPageChange={ledgerPagination.handleChangePage}
                                        onRowsPerPageChange={ledgerPagination.handleChangeRowsPerPage}
                                        sx={{ borderTop: 'none', mt: 1 }}
                                    />
                                )}
                            </>
                        )}
                    </DashboardCard>
                </Box>

                {/* RIGHT SIDEBAR — 380px wide, three stacked cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0, width: '100%' }}>
                    {/* Overdue Invoice Warnings */}
                    <DashboardCard
                        title="Overdue Invoice Warnings"
                        subtitle="Invoices unpaid or partially paid past due dates."
                        icon={AlertTriangle}
                        iconColor={alertListIconColor}
                        iconBg={alertListIconBg}
                    >
                        <Box sx={{
                            maxHeight: 260, overflowY: 'auto', width: '100%',
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': { borderRadius: '4px', bgcolor: 'divider' }
                        }}>
                            {overdueAlerts.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.08)', color: 'success.main', mb: 1 }}>
                                        <ShieldCheck size={22} />
                                    </Box>
                                    <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '13px', fontFamily: FONTS.HEADING, display: 'block' }}>
                                        Clear Ledger
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                        No overdue invoices at present.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {overdueAlerts.map((alert) => (
                                        <Box key={alert.id} sx={{
                                            p: 1.5, borderRadius: '8px', border: '1px solid',
                                            borderColor: isDark ? 'rgba(186,26,26,0.2)' : 'rgba(186,26,26,0.12)',
                                            borderLeft: '3px solid', borderLeftColor: COLORS.DANGER,
                                            bgcolor: isDark ? 'rgba(186,26,26,0.04)' : 'rgba(186,26,26,0.012)',
                                            transition: 'background 0.15s ease',
                                            '&:hover': { bgcolor: isDark ? 'rgba(186,26,26,0.08)' : 'rgba(186,26,26,0.03)' }
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '12px', fontFamily: FONTS.HEADING, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {alert.patient_name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontFamily: FONTS.BODY, mt: 0.2 }}>
                                                        {alert.patient_mrn} · Due {alert.due_date}
                                                    </Typography>
                                                </Box>
                                                <Chip label={`${alert.days_overdue}d`} color="error" size="small"
                                                    sx={{ fontWeight: 700, fontSize: '9px', height: 16, ml: 1, flexShrink: 0 }} />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
                                                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                                    Paid {formatCurrency(alert.paid_amount)}
                                                </Typography>
                                                <Typography sx={{ fontWeight: 800, color: 'error.main', fontSize: '11px', fontFamily: FONTS.HEADING }}>
                                                    {formatCurrency(alert.remaining_balance)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>

                    {/* Collection Methods */}
                    <DashboardCard
                        title="Collection Methods"
                        subtitle="Share of collections by payment channel."
                        icon={Wallet}
                        iconColor={neutralIconColor}
                        iconBg={neutralIconBg}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            {channelSplits.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', display: 'block', py: 3, fontSize: '12px', color: 'text.secondary' }}>
                                    No collection methods logged.
                                </Typography>
                            ) : channelSplits.map((item, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                                        <Typography sx={{
                                            fontWeight: 600, fontSize: '11.5px', fontFamily: FONTS.HEADING,
                                            color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', flex: 1, minWidth: 0, pr: 1
                                        }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, color: getPaymentMethodColor(item.payment_method), fontSize: '11.5px', flexShrink: 0 }}>
                                            {item.percentage}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={item.percentage}
                                            sx={{
                                                flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': { bgcolor: getPaymentMethodColor(item.payment_method), borderRadius: 3 }
                                            }}
                                        />
                                        <Typography sx={{ fontSize: '10px', color: 'text.secondary', whiteSpace: 'nowrap', minWidth: '52px', textAlign: 'right' }}>
                                            {formatCurrency(item.total)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </DashboardCard>

                    {/* Insurance Panels */}
                    <DashboardCard
                        title="Insurance Panels"
                        subtitle="Claims distribution across active insurance panels."
                        icon={Award}
                        iconColor={neutralIconColor}
                        iconBg={neutralIconBg}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            {insurancePanel.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', display: 'block', py: 3, fontSize: '12px', color: 'text.secondary', fontStyle: 'italic' }}>
                                    No active insurance panel claims logged.
                                </Typography>
                            ) : insurancePanel.map((item, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                                        <Typography sx={{
                                            fontWeight: 600, fontSize: '11.5px', fontFamily: FONTS.HEADING,
                                            color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', flex: 1, minWidth: 0, pr: 1
                                        }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, color: getInsuranceColor(item.insurance_provider), fontSize: '11.5px', flexShrink: 0 }}>
                                            {item.percentage}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={item.percentage}
                                            sx={{
                                                flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': { bgcolor: getInsuranceColor(item.insurance_provider), borderRadius: 3 }
                                            }}
                                        />
                                        <Typography sx={{ fontSize: '10px', color: 'text.secondary', whiteSpace: 'nowrap', minWidth: '52px', textAlign: 'right' }}>
                                            {formatCurrency(item.total)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );

    // ── Page Shell ───────────────────────────────────────────────────────
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 4 } }}>
            <PageHeader
                title="Financial Control & Billing Oversight"
                subtitle="Monitor hospital revenue splits, panel coverage, outstanding collections, and FBR withholding compliance."
                onRefresh={handleSyncAll}
                loading={loading}
                refreshLabel="Sync Ledger"
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: { xs: 0, md: -1 }, mb: 1 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, val) => setActiveTab(val)} 
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="revenue folders"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                            height: 3,
                            borderRadius: '3px',
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '12px', md: '14px' },
                            color: 'text.secondary',
                            pb: 1.5,
                            '&.Mui-selected': {
                                color: 'primary.main',
                            },
                        }
                    }}
                >
                    <Tab label="Billing & Oversight" />
                    <Tab label="Tax Reconciliation" />
                </Tabs>
            </Box>

            <AsyncWrapper loading={false} error={error}>
                {activeTab === 0 && renderBillingOversight()}
                {activeTab === 1 && renderFBRTaxReconciliation()}
            </AsyncWrapper>
        </Box>
    );
};

export default Revenue;
