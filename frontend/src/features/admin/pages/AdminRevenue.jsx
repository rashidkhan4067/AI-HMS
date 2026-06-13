import { useMemo, useState } from 'react';
import { 
    Box, Card, CardContent, Grid, Typography, LinearProgress, Alert, Skeleton, useTheme, Chip, Tabs, Tab, Divider
} from '@mui/material';
import { 
    TrendingUp, ShieldCheck, DollarSign, Wallet, ShoppingCart, Award, Coins, AlertTriangle, Clock, FileText
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { formatPKR as formatCurrency } from '../../../shared/utils/formatUtils';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { 
    AdminPageHeader, StatCard, SectionCard, DataTable, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const AdminRevenue = () => {
    const theme = useTheme();
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

    const handleSyncAll = async () => {
        if (activeTab === 0) {
            await refreshRevenue();
        } else {
            await refreshBillingOversight();
        }
    };

    // TAB 1 DATA CALCS
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

    // TAB 2 DATA CALCS
    const aggregates = billingOversight?.aggregates || { total_collected: 0, patient_receivables: 0, insurance_receivables: 0, total_overdue: 0, overdue_count: 0 };
    const overdueAlerts = billingOversight?.overdue_alerts || [];
    const ledger = billingOversight?.ledger || [];
    const dailyCollections = billingOversight?.daily_collections || [];
    
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

    // Ledger Pagination Hooks
    const ledgerPagination = usePagination();
    const paginatedLedger = useMemo(() => ledgerPagination.paginate(ledger), [ledger, ledgerPagination]);

    const fbrTableColumns = [
        { id: 'category', label: 'Ledger Category' },
        { id: 'total', label: 'Calculated Total', align: 'right' }
    ];

    const fbrTableData = [
        { id: 1, category: 'Gross Medical Consults', total: formatCurrency(doctorConsultations.gross_amount) },
        { id: 2, category: 'Withholding Tax Liability', total: <Typography sx={{ color: 'error.main', fontWeight: 600 }}>-{formatCurrency(doctorConsultations.withholding_tax_deducted)}</Typography> },
        { id: 3, category: <Typography sx={{ fontWeight: 700 }}>Total Net Doctors Ledger</Typography>, total: <Typography sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(doctorConsultations.net_payout)}</Typography> }
    ];

    const ledgerColumns = [
        { id: 'id', label: 'Invoice ID', render: (inv) => <Typography sx={{ fontFamily: 'monospace', fontSize: '11px' }}>{inv.id.substring(0, 8).toUpperCase()}...</Typography> },
        { id: 'patient_name', label: 'Patient Name', render: (inv) => <Typography sx={{ fontWeight: 600 }}>{inv.patient_name}</Typography> },
        { id: 'patient_mrn', label: 'MRN', render: (inv) => <Typography sx={{ fontFamily: 'monospace' }}>{inv.patient_mrn}</Typography> },
        { id: 'doctor_name', label: 'Physician', render: (inv) => `Dr. ${inv.doctor_name}` },
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AdminPageHeader
                title="Financial Control & Billing Oversight"
                subtitle="Monitor hospital revenue splits, panel coverage, outstanding collections, and FBR withholding compliance."
                onRefresh={handleSyncAll}
                loading={loading}
                refreshLabel="Sync Ledger"
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' }, '& .MuiTab-root': { fontWeight: 700, fontSize: '14px', px: 3 } }}>
                    <Tab label="FBR Tax Reconciliation" />
                    <Tab label="Billing & Insurance Oversight" />
                </Tabs>
            </Box>

            <AsyncWrapper loading={false} error={error}>
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Grid container spacing={3}>
                            <StatCard title="Gross Consultation Fees" value={formatCurrency(doctorConsultations.gross_amount)} description={`${doctorConsultations.count} Physician visits billed`} icon={DollarSign} color={COLORS.PRIMARY} loading={loading} chipLabel="Today" />
                            <StatCard title="FBR Withholding Tax (10%)" value={formatCurrency(doctorConsultations.withholding_tax_deducted)} description="Fitted standard withholding" icon={ShieldCheck} color={COLORS.DANGER} loading={loading} chipLabel="Today" />
                            <StatCard title="Net Doctor Payouts" value={formatCurrency(doctorConsultations.net_payout)} description="Professional fees after FBR tax" icon={Wallet} color={COLORS.SUCCESS} loading={loading} chipLabel="Today" />
                            <StatCard title="Pharmacy Dispensations" value={formatCurrency(pharmacySales.total_amount)} description={`${pharmacySales.total_dispensed} Prescription orders`} icon={ShoppingCart} color={COLORS.INFO} loading={loading} chipLabel="Today" />
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <SectionCard title="Collection Channels Reconciliation" subtitle="Cash collections reconciled against POS Credit Card terminal registers and digital transfers." loading={loading}>
                                    {paymentMethodsFBR.length === 0 ? (
                                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>No transaction records registered today.</Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                                            {paymentMethodsFBR.map((method, idx) => (
                                                <Box key={idx}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING }}>{method.label}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{method.count} transaction receipts logged</Typography>
                                                        </Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: FONTS.HEADING }}>
                                                            {formatCurrency(method.amount)} <span style={{ fontSize: '11px', fontWeight: 500, color: theme.palette.text.secondary }}>({method.percentage}%)</span>
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={method.percentage} sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 } }} />
                                                </Box>
                                            ))}
                                            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING }}>Total Reconciled Collections</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: FONTS.HEADING, color: 'success.main' }}>{formatCurrency(totalCollectedFBR)}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </SectionCard>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <SectionCard title="FBR Tax Auditor Details" icon={TrendingUp} iconColor={COLORS.DANGER} iconBg={`${COLORS.DANGER}15`} loading={loading}>
                                    <Box sx={{ bgcolor: 'action.hover', p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Standard Withholding Tax Rules:</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 1, lineHeight: 1.4 }}>Section 153(1)(b) — Income Tax Ordinance</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>Professional fees paid to doctors are subject to a standard 10% withholding tax for active tax filers. This dashboard calculates fitment thresholds and aggregates net doctor payout obligations dynamically.</Typography>
                                    </Box>

                                    <DataTable columns={fbrTableColumns} data={fbrTableData} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Ledger report generated automatically at {revenue?.date_generated || new Date().toISOString().split('T')[0]}. All transactions subject to audit logging.</Typography>
                                    </Box>
                                </SectionCard>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Grid container spacing={3}>
                            <StatCard title="Total Collections" value={formatCurrency(aggregates.total_collected)} description="Total cash/card/mobile collected" icon={Coins} color={COLORS.SUCCESS} loading={loading} />
                            <StatCard title="Patient Receivables" value={formatCurrency(aggregates.patient_receivables)} description="Remaining unpaid patient balance" icon={FileText} color={COLORS.WARNING} loading={loading} />
                            <StatCard title="Pending Panel Claims" value={formatCurrency(aggregates.insurance_receivables)} description="Awaiting insurance reimbursement" icon={Award} color={COLORS.INFO} loading={loading} />
                            <StatCard title="Overdue Balance" value={formatCurrency(aggregates.total_overdue)} description={`${aggregates.overdue_count} overdue invoice alerts`} icon={AlertTriangle} color={COLORS.DANGER} loading={loading} chipLabel={aggregates.overdue_count > 0 ? 'ALERT' : 'Oversight'} chipColor={aggregates.overdue_count > 0 ? 'error' : 'default'} />
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <SectionCard title="Overdue Invoice Warnings" subtitle="List of invoices that remain unpaid or partially paid past their designated due dates." icon={AlertTriangle} iconColor={COLORS.DANGER} iconBg={`${COLORS.DANGER}15`} loading={loading}>
                                    <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 1 }}>
                                        {overdueAlerts.length === 0 ? (
                                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                                <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(76, 175, 80, 0.08)', color: 'success.main', mb: 1 }}>
                                                    <ShieldCheck size={26} />
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>Clear Ledger Compliance</Typography>
                                                <Typography variant="caption" color="text.secondary">No overdue invoice warnings active at present.</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {overdueAlerts.map((alert) => (
                                                    <Card key={alert.id} variant="outlined" sx={{ p: 2, borderRadius: '12px', borderColor: 'divider', bgcolor: 'rgba(186, 26, 26, 0.01)' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{alert.patient_name}</Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>MRN: {alert.patient_mrn} | Due Date: {alert.due_date}</Typography>
                                                            </Box>
                                                            <Chip label={`${alert.days_overdue} Days Late`} color="error" size="small" sx={{ fontWeight: 700, fontSize: '10px' }} />
                                                        </Box>
                                                        <Divider sx={{ my: 1 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary">Paid: {formatCurrency(alert.paid_amount)} | Claim: {formatCurrency(alert.insurance_amount)}</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'error.main' }}>Balance Owed: {formatCurrency(alert.remaining_balance)}</Typography>
                                                        </Box>
                                                    </Card>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </SectionCard>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SectionCard title="Collections Trend (Last 30 Days)" subtitle="Visual log of cash collections reconciled on a daily basis." icon={Clock} iconColor={COLORS.SUCCESS} iconBg={`${COLORS.SUCCESS}15`} loading={loading}>
                                    <Box sx={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                        {dailyCollections.length === 0 ? (
                                            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary', width: '100%' }}>No collection data logged in the past 30 days.</Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', pt: 2, pb: 1, gap: 1 }}>
                                                {dailyCollections.slice(-15).map((d, index) => {
                                                    const heightPercent = Math.max(10, Math.round((d.total / maxDailyCollection) * 100));
                                                    return (
                                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, height: '100%', justifyContent: 'flex-end' }}>
                                                            <Box sx={{ width: '100%', height: `${heightPercent}%`, background: 'linear-gradient(180deg, #006A6A 0%, #00a3a3 100%)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease', minWidth: '12px', '&:hover': { opacity: 0.8 } }} title={`Date: ${d.date}\nCollected: ${formatCurrency(d.total)}\nReceipts: ${d.count}`} />
                                                            <Typography variant="caption" sx={{ fontSize: '8px', mt: 0.5, color: 'text.secondary', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>{d.date.substring(5)}</Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Box>
                                </SectionCard>
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <SectionCard title="Collection Methods Split" subtitle="Total share of collections by cash register, card terminal, or mobile wallet." loading={loading}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                                        {channelSplits.length === 0 ? (
                                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', py: 4 }}>No collection methods logged.</Typography>
                                        ) : (
                                            channelSplits.map((item, idx) => (
                                                <Box key={idx}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</Typography>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: 'primary.main', fontSize: '13px' }}>{formatCurrency(item.total)} ({item.percentage}%)</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={item.percentage} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }} />
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </SectionCard>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SectionCard title="Insurance Panel Distribution" subtitle="Reimbursements and claims split across active Pakistani panels and Sehat cards." loading={loading}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                                        {insurancePanel.length === 0 ? (
                                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', py: 4, fontStyle: 'italic' }}>No active insurance panel claims logged in system.</Typography>
                                        ) : (
                                            insurancePanel.map((item, idx) => (
                                                <Box key={idx}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</Typography>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: 'info.main', fontSize: '13px' }}>{formatCurrency(item.total)} ({item.percentage}%)</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={item.percentage} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'info.main', borderRadius: 3 } }} />
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </SectionCard>
                            </Grid>
                        </Grid>

                        <SectionCard title="Daily Transaction Ledger (Clinical-Blind)" subtitle="Reconciled logs of transactions. In compliance with data regulations, clinical descriptions, notes, and diagnoses are strictly omitted." loading={loading}>
                            <DataTable 
                                columns={ledgerColumns}
                                data={paginatedLedger}
                                paginationState={{ ...ledgerPagination, count: ledger.length }}
                                emptyMessage="No transaction records found."
                            />
                        </SectionCard>
                    </Box>
                )}
            </AsyncWrapper>
        </Box>
    );
};

export default AdminRevenue;
