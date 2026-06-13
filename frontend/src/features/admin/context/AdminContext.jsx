import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { departmentApi } from '../../departments/services/departmentApi';
import { invitationApi } from '../../invitations/services/invitationApi';
import { applicationApi } from '../../applications/services/applicationApi';
import { LOCAL_STORAGE_KEYS } from '../../../shared/constants';

const AdminContext = createContext(null);

const getCachedData = () => {
    try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_CACHE);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null; // Silent fallback
    }
};

export const AdminProvider = ({ children }) => {
    const cached = getCachedData();

    const [overview, setOverview] = useState(cached?.overview || {
        total_active_staff: 0,
        pending_applications: 0,
        active_invite_tokens: 0,
        security_warnings: 0,
    });
    const [users, setUsers] = useState(cached?.users || []);
    const [invites, setInvites] = useState(cached?.invites || []);
    const [applications, setApplications] = useState(cached?.applications || []);
    const [audits, setAudits] = useState(cached?.audits || []);
    const [departments, setDepartments] = useState(cached?.departments || []);

    // New feature states
    const [compliance, setCompliance] = useState(cached?.compliance || []);
    const [revenue, setRevenue] = useState(cached?.revenue || null);
    const [billingOversight, setBillingOversight] = useState(cached?.billingOversight || null);
    const [wards, setWards] = useState(cached?.wards || []);
    const [beds, setBeds] = useState(cached?.beds || []);
    const [admissions, setAdmissions] = useState(cached?.admissions || []);
    const [rosters, setRosters] = useState(cached?.rosters || []);
    const [appointments, setAppointments] = useState(cached?.appointments || []);

    const hasCache = !!cached;
    const initialLoading = !hasCache;

    const [loadingStates, setLoadingStates] = useState({
        overview: initialLoading, users: initialLoading, invites: initialLoading,
        applications: initialLoading, audits: initialLoading, departments: initialLoading,
        compliance: initialLoading, revenue: initialLoading, billingOversight: initialLoading,
        wards: initialLoading, beds: initialLoading, admissions: initialLoading,
        rosters: initialLoading, appointments: initialLoading,
    });

    const [errorStates, setErrorStates] = useState({
        overview: null, users: null, invites: null, applications: null, audits: null,
        departments: null, compliance: null, revenue: null, billingOversight: null,
        wards: null, beds: null, admissions: null, rosters: null, appointments: null,
    });

    const [isSyncing, setIsSyncing] = useState(false);

    // --- Generic Refresh Factory ---
    const createRefresh = useCallback((key, apiCall, setter, errorMsg, transform = (d) => d) => {
        return async (...args) => {
            setLoadingStates(prev => ({ ...prev, [key]: true }));
            setErrorStates(prev => ({ ...prev, [key]: null }));
            try {
                const data = await apiCall(...args);
                setter(transform(data));
            } catch (err) {
                setErrorStates(prev => ({ ...prev, [key]: errorMsg }));
            } finally {
                setLoadingStates(prev => ({ ...prev, [key]: false }));
            }
        };
    }, []);

    const refreshOverview = createRefresh('overview', adminApi.getOverview, setOverview, 'Failed to load metrics.');
    const refreshUsers = createRefresh('users', adminApi.getUsers, setUsers, 'Failed to load users.');
    const refreshInvites = createRefresh('invites', invitationApi.getInvites, setInvites, 'Failed to load invites.');
    const refreshApplications = createRefresh('applications', applicationApi.getApplications, setApplications, 'Failed to load applications.');
    const refreshAudits = createRefresh('audits', adminApi.getAudits, setAudits, 'Failed to load audit logs.', d => d.results || d);
    const refreshDepartments = createRefresh('departments', departmentApi.getAdminList, setDepartments, 'Failed to load departments.', d => d.results || d);
    const refreshCompliance = createRefresh('compliance', adminApi.getPMDCCompliance, setCompliance, 'Failed to load PMDC compliance records.');
    const refreshRevenue = createRefresh('revenue', adminApi.getRevenueReconciliation, setRevenue, 'Failed to load revenue metrics.');
    const refreshBillingOversight = createRefresh('billingOversight', adminApi.getBillingOversight, setBillingOversight, 'Failed to load billing oversight metrics.');
    const refreshWards = createRefresh('wards', adminApi.getWards, setWards, 'Failed to load IPD wards.');
    const refreshBeds = createRefresh('beds', adminApi.getBeds, setBeds, 'Failed to load IPD beds.');
    const refreshAdmissions = createRefresh('admissions', adminApi.getAdmissions, setAdmissions, 'Failed to load admission records.');
    const refreshRosters = createRefresh('rosters', adminApi.getRosters, setRosters, 'Failed to load duty rosters.');
    const refreshAppointments = createRefresh('appointments', adminApi.getAppointments, setAppointments, 'Failed to load appointments.', d => d.results || d);

    const refreshAll = useCallback(async (forceLoading = false) => {
        const cachedData = getCachedData();
        const shouldLoad = forceLoading || !cachedData;

        if (shouldLoad) {
            setLoadingStates(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        }
        setIsSyncing(true);
        setErrorStates(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: null }), {}));

        try {
            const data = await adminApi.getDashboardData();
            setOverview(data.overview);
            setUsers(data.users);
            setInvites(data.invites);
            setApplications(data.applications);
            setAudits(data.audits);
            if (data.departments) setDepartments(data.departments);
        } catch (err) {
            console.error("getDashboardData failed, attempting legacy fallbacks...", err);
            // Fallback: Fire legacy requests concurrently
            const results = await Promise.allSettled([
                adminApi.getOverview().then(setOverview),
                adminApi.getUsers().then(setUsers),
                invitationApi.getInvites().then(setInvites),
                applicationApi.getApplications().then(setApplications),
                adminApi.getAudits().then(res => setAudits(res.results || res)),
                departmentApi.getAdminList().then(res => setDepartments(res.results || res)),
            ]);

            const keys = ['overview', 'users', 'invites', 'applications', 'audits', 'departments'];
            results.forEach((res, idx) => {
                if (res.status === 'rejected') {
                    const key = keys[idx];
                    console.error(`Fallback failed for ${key}:`, res.reason);
                    setErrorStates(prev => ({ ...prev, [key]: `Failed to sync ${key}.` }));
                }
            });
        }

        // Parallel fetch of new features data
        try {
            const results = await Promise.allSettled([
                adminApi.getPMDCCompliance(),
                adminApi.getRevenueReconciliation(),
                adminApi.getBillingOversight(),
                adminApi.getWards(),
                adminApi.getBeds(),
                adminApi.getAdmissions(),
                adminApi.getRosters(),
                adminApi.getAppointments()
            ]);

            const setIfSuccess = (res, setter, key, errStr, transform = d => d) => {
                if (res.status === 'fulfilled') setter(transform(res.value));
                else setErrorStates(prev => ({ ...prev, [key]: errStr }));
            };

            setIfSuccess(results[0], setCompliance, 'compliance', 'Failed to load PMDC records');
            setIfSuccess(results[1], setRevenue, 'revenue', 'Failed to load revenue metrics');
            setIfSuccess(results[2], setBillingOversight, 'billingOversight', 'Failed to load billing metrics');
            setIfSuccess(results[3], setWards, 'wards', 'Failed to load wards');
            setIfSuccess(results[4], setBeds, 'beds', 'Failed to load beds');
            setIfSuccess(results[5], setAdmissions, 'admissions', 'Failed to load admissions');
            setIfSuccess(results[6], setRosters, 'rosters', 'Failed to load duty rosters');
            setIfSuccess(results[7], setAppointments, 'appointments', 'Failed to load appointments', d => d.results || d);

        } catch (err) {
            // Silent fallback
        } finally {
            setLoadingStates(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
            setIsSyncing(false);
        }
    }, []);

    // Load everything on mount
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Save changes to localStorage cache in real time
    useEffect(() => {
        const hasData = overview.total_active_staff > 0 || users.length > 0 || invites.length > 0 || applications.length > 0 || audits.length > 0 || departments.length > 0 || compliance.length > 0 || wards.length > 0 || rosters.length > 0 || appointments.length > 0;
        if (hasData) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_CACHE, JSON.stringify({
                    overview, users, invites, applications, audits, departments, compliance,
                    revenue, billingOversight, wards, beds, admissions, rosters, appointments,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // Silent fallback
            }
        }
    }, [overview, users, invites, applications, audits, departments, compliance, revenue, billingOversight, wards, beds, admissions, rosters, appointments]);

    return (
        <AdminContext.Provider value={{
            overview, users, invites, applications, audits, departments,
            compliance, revenue, billingOversight, wards, beds, admissions,
            rosters, appointments, loadingStates, errorStates, isSyncing,
            refreshOverview, refreshUsers, refreshInvites, refreshApplications,
            refreshAudits, refreshDepartments, refreshCompliance, refreshRevenue,
            refreshBillingOversight, refreshWards, refreshBeds, refreshAdmissions,
            refreshRosters, refreshAppointments, refreshAll,
            setUsers, setInvites, setApplications, setDepartments,
            setCompliance, setRevenue, setBillingOversight, setWards,
            setBeds, setAdmissions, setRosters, setAppointments,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
