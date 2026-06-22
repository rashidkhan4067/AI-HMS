import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { PageHeader, AsyncWrapper } from '../../../shared/components/ui';
import { KPIs } from '../components/KPIs';
import {
    ComplianceAlertBanner,
    OperationsMonitor,
    ConsoleControls,
    InfrastructureStatus,
    FinancialsSnapshot,
    BedOccupancySnapshot,
    StaffComplianceTimeline,
    StaffDirectoryAllocations,
    RecentSecurityActivity,
    DepartmentOperations
} from '../components/dashboard';

export const DashboardOverview = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    
    const { 
        overview: stats, 
        users,
        audits = [],
        compliance = [],
        beds = [],
        billingOversight = null,
        loadingStates, 
        errorStates, 
        refreshAll 
    } = useAdmin();

    const loading = loadingStates.overview || loadingStates.compliance;
    const error = errorStates.overview || errorStates.compliance;

    // Diagnostics Simulator State
    const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
    const [diagnosticsOutput, setDiagnosticsOutput] = useState([
        { label: 'PostgreSQL Database Connection', status: 'Optimal', latency: '14ms', color: '#1D6B35' },
        { label: 'SMTP Email Dispatch Service', status: 'Connected', latency: '38ms', color: '#1D6B35' },
        { label: 'Google OAuth API Gateway', status: 'Online', latency: '24ms', color: '#1D6B35' },
        { label: 'JWT Signature Token Issuance', status: 'Secured', latency: '2ms', color: '#1D6B35' }
    ]);
    const [diagnosticsMessage, setDiagnosticsMessage] = useState('All systems reporting nominal status.');

    const runDiagnostics = useCallback(async () => {
        setDiagnosticsLoading(true);
        setDiagnosticsMessage('Initiating system-wide handshake diagnostics...');
        try {
            const res = await adminApi.getSystemHealth();
            setDiagnosticsOutput(res.diagnostics);
            setDiagnosticsMessage(`Diagnostics complete. ${res.message}`);
        } catch (err) {
            setDiagnosticsMessage('Failed to connect to backend diagnostics endpoint.');
        } finally {
            setDiagnosticsLoading(false);
        }
    }, []);

    const expiringDoctorsCount = useMemo(() => {
        return compliance.filter(doc => doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 60)).length;
    }, [compliance]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 4 } }}>
            <PageHeader
                title="System Administration Overview"
                subtitle="Monitor real-time system health, manage staff onboarding requests, and review active directory configurations."
                onRefresh={() => refreshAll(true)}
                loading={loading}
            />

            <AsyncWrapper loading={loading} error={error}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <ComplianceAlertBanner 
                        expiringDoctorsCount={expiringDoctorsCount} 
                        onResolve={() => navigate('/admin/compliance?status=ALERT')} 
                    />

                    {/* KPI Cards (Always pinned top) */}
                    <KPIs stats={stats} loading={loading} />

                    {/* Mobile Tab Swapper */}
                    {isMobile ? (
                        <>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 1 }}>
                                <Tabs 
                                    value={activeTab} 
                                    onChange={handleTabChange} 
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    aria-label="dashboard folders"
                                    sx={{
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: 'primary.main',
                                        },
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontFamily: theme.typography.fontFamily,
                                            fontSize: '12px',
                                            color: 'text.secondary',
                                            '&.Mui-selected': {
                                                color: 'primary.main',
                                            },
                                        }
                                    }}
                                >
                                    <Tab label="Flow Funnels" />
                                    <Tab label="Diagnostics" />
                                    <Tab label="Resources" />
                                </Tabs>
                            </Box>

                            {/* Tab Content 0: Flows */}
                            {activeTab === 0 && (
                                <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <OperationsMonitor stats={stats} onNavigate={navigate} />
                                    <DepartmentOperations />
                                </Box>
                            )}

                            {/* Tab Content 1: System & Security */}
                            {activeTab === 1 && (
                                <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <ConsoleControls stats={stats} onNavigate={navigate} />
                                    <InfrastructureStatus 
                                        diagnosticsLoading={diagnosticsLoading}
                                        diagnosticsOutput={diagnosticsOutput}
                                        diagnosticsMessage={diagnosticsMessage}
                                        onRunDiagnostics={runDiagnostics}
                                    />
                                    <RecentSecurityActivity 
                                        audits={audits} 
                                        loadingStates={loadingStates} 
                                        onNavigate={navigate} 
                                    />
                                </Box>
                            )}

                            {/* Tab Content 2: Finance & Compliance */}
                            {activeTab === 2 && (
                                <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <FinancialsSnapshot 
                                        oversight={billingOversight} 
                                        loadingStates={loadingStates} 
                                        errorStates={errorStates} 
                                        onNavigate={navigate} 
                                    />
                                    <BedOccupancySnapshot 
                                        beds={beds} 
                                        loadingStates={loadingStates} 
                                        errorStates={errorStates} 
                                        onNavigate={navigate} 
                                    />
                                    <StaffComplianceTimeline 
                                        compliance={compliance} 
                                        loadingStates={loadingStates} 
                                        errorStates={errorStates} 
                                        onNavigate={navigate} 
                                    />
                                    <StaffDirectoryAllocations users={users} stats={stats} />
                                </Box>
                            )}
                        </>
                    ) : (
                        /* Desktop Full Grid Layout */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5, width: '100%' }}>
                            {/* Operations Monitor — full width KPI strip */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <OperationsMonitor stats={stats} onNavigate={navigate} />
                            </motion.div>

                            {/* Clinical Departments Snapshot - full width */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <DepartmentOperations />
                            </motion.div>

                            {/* Row 1: Console Controls | Infrastructure Status | Financials Snapshot — equal thirds */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 2,
                                alignItems: 'stretch',
                                width: '100%',
                            }}>
                                <ConsoleControls stats={stats} onNavigate={navigate} />
                                <InfrastructureStatus
                                    diagnosticsLoading={diagnosticsLoading}
                                    diagnosticsOutput={diagnosticsOutput}
                                    diagnosticsMessage={diagnosticsMessage}
                                    onRunDiagnostics={runDiagnostics}
                                />
                                <FinancialsSnapshot
                                    oversight={billingOversight}
                                    loadingStates={loadingStates}
                                    errorStates={errorStates}
                                    onNavigate={navigate}
                                />
                            </Box>

                            {/* Row 2: Bed Occupancy (1fr) | PMDC Compliance (1fr) | Staff Directory (2fr) */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 2fr',
                                gap: 2,
                                alignItems: 'stretch',
                                width: '100%',
                            }}>
                                <BedOccupancySnapshot
                                    beds={beds}
                                    loadingStates={loadingStates}
                                    errorStates={errorStates}
                                    onNavigate={navigate}
                                />
                                <StaffComplianceTimeline
                                    compliance={compliance}
                                    loadingStates={loadingStates}
                                    errorStates={errorStates}
                                    onNavigate={navigate}
                                />
                                <StaffDirectoryAllocations users={users} stats={stats} />
                            </Box>

                            {/* Row 3: Recent Security Activity — full width */}
                            <RecentSecurityActivity
                                audits={audits}
                                loadingStates={loadingStates}
                                onNavigate={navigate}
                            />
                        </Box>
                    )}
                </Box>
            </AsyncWrapper>
        </Box>
    );
};

export default DashboardOverview;
