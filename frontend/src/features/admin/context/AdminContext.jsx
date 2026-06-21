import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();
    const cached = getCachedData();
    const location = useLocation();
    const path = location.pathname;

    // Path-based dynamic enabling to prevent rendering request storms (lazy load only what is active)
    const isDashboard = path === '/admin/dashboard' || path === '/admin' || path === '/admin/';
    const isOverviewEnabled = isDashboard;
    const isUsersEnabled = path.startsWith('/admin/users') || isDashboard;
    const isInvitesEnabled = path.startsWith('/admin/invites');
    const isApplicationsEnabled = path.startsWith('/admin/applications') || isDashboard;
    const isAuditsEnabled = path.startsWith('/admin/audits') || isDashboard;
    const isComplianceEnabled = path.startsWith('/admin/compliance') || isDashboard;
    const isRostersEnabled = path.startsWith('/admin/roster');
    const isDepartmentsEnabled = path.startsWith('/admin/departments') || isDashboard;
    const isAppointmentsEnabled = path.startsWith('/admin/appointments');
    const isRevenueEnabled = path.startsWith('/admin/revenue');
    const isBillingOversightEnabled = path.startsWith('/admin/revenue') || isDashboard;
    const isBedsEnabled = path.startsWith('/admin/ipd') || isDashboard;
    const isAdmissionsEnabled = path.startsWith('/admin/ipd');
    const isWardsEnabled = path.startsWith('/admin/ipd');

    // --- Queries ---

    // Real-time data (staleTime: 30 seconds)
    const overviewQuery = useQuery({
        queryKey: ['adminOverview'],
        queryFn: adminApi.getOverview,
        staleTime: 30 * 1000,
        initialData: cached?.overview || {
            total_active_staff: 0,
            pending_applications: 0,
            active_invite_tokens: 0,
            security_warnings: 0,
        },
        enabled: isOverviewEnabled,
    });

    const appointmentsQuery = useQuery({
        queryKey: ['adminAppointments'],
        queryFn: async () => {
            const data = await adminApi.getAppointments();
            return data.results || data;
        },
        staleTime: 30 * 1000,
        initialData: cached?.appointments || [],
        enabled: isAppointmentsEnabled,
    });

    const revenueQuery = useQuery({
        queryKey: ['adminRevenue'],
        queryFn: adminApi.getRevenueReconciliation,
        staleTime: 30 * 1000,
        initialData: cached?.revenue || null,
        enabled: isRevenueEnabled,
    });

    const billingOversightQuery = useQuery({
        queryKey: ['adminBillingOversight'],
        queryFn: adminApi.getBillingOversight,
        staleTime: 30 * 1000,
        initialData: cached?.billingOversight || null,
        enabled: isBillingOversightEnabled,
    });

    const bedsQuery = useQuery({
        queryKey: ['adminBeds'],
        queryFn: adminApi.getBeds,
        staleTime: 30 * 1000,
        initialData: cached?.beds || [],
        enabled: isBedsEnabled,
    });

    const admissionsQuery = useQuery({
        queryKey: ['adminAdmissions'],
        queryFn: adminApi.getAdmissions,
        staleTime: 30 * 1000,
        initialData: cached?.admissions || [],
        enabled: isAdmissionsEnabled,
    });

    // Semi-dynamic data (staleTime: 5 minutes)
    const usersQuery = useQuery({
        queryKey: ['adminUsers'],
        queryFn: adminApi.getUsers,
        staleTime: 5 * 60 * 1000,
        initialData: cached?.users || [],
        enabled: isUsersEnabled,
    });

    const invitesQuery = useQuery({
        queryKey: ['adminInvites'],
        queryFn: invitationApi.getInvites,
        staleTime: 5 * 60 * 1000,
        initialData: cached?.invites || [],
        enabled: isInvitesEnabled,
    });

    const applicationsQuery = useQuery({
        queryKey: ['adminApplications'],
        queryFn: applicationApi.getApplications,
        staleTime: 5 * 60 * 1000,
        initialData: cached?.applications || [],
        enabled: isApplicationsEnabled,
    });

    const auditsQuery = useQuery({
        queryKey: ['adminAudits'],
        queryFn: async () => {
            const data = await adminApi.getAudits();
            return data.results || data;
        },
        staleTime: 5 * 60 * 1000,
        initialData: cached?.audits || [],
        enabled: isAuditsEnabled,
    });

    const complianceQuery = useQuery({
        queryKey: ['adminCompliance'],
        queryFn: adminApi.getPMDCCompliance,
        staleTime: 5 * 60 * 1000,
        initialData: cached?.compliance || [],
        enabled: isComplianceEnabled,
    });

    const rostersQuery = useQuery({
        queryKey: ['adminRosters'],
        queryFn: adminApi.getRosters,
        staleTime: 5 * 60 * 1000,
        initialData: cached?.rosters || [],
        enabled: isRostersEnabled,
    });

    // Static data (staleTime: 30 minutes)
    const departmentsQuery = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const data = await departmentApi.getAdminList();
            return data.results || data;
        },
        staleTime: 30 * 60 * 1000,
        initialData: cached?.departments || [],
        enabled: isDepartmentsEnabled,
    });

    const wardsQuery = useQuery({
        queryKey: ['adminWards'],
        queryFn: adminApi.getWards,
        staleTime: 30 * 60 * 1000,
        initialData: cached?.wards || [],
        enabled: isWardsEnabled,
    });

    // --- Extracted Data ---
    const overview = overviewQuery.data?.overview || overviewQuery.data;
    const users = usersQuery.data;
    const invites = invitesQuery.data;
    const applications = applicationsQuery.data;
    const audits = auditsQuery.data;
    const departments = departmentsQuery.data;
    const compliance = complianceQuery.data;
    const revenue = revenueQuery.data;
    const billingOversight = billingOversightQuery.data;
    const wards = wardsQuery.data;
    const beds = bedsQuery.data;
    const admissions = admissionsQuery.data;
    const rosters = rostersQuery.data;
    const appointments = appointmentsQuery.data;

    // --- Loading & Error States ---
    const loadingStates = {
        overview: overviewQuery.isLoading,
        users: usersQuery.isLoading,
        invites: invitesQuery.isLoading,
        applications: applicationsQuery.isLoading,
        audits: auditsQuery.isLoading,
        departments: departmentsQuery.isLoading,
        compliance: complianceQuery.isLoading,
        revenue: revenueQuery.isLoading,
        billingOversight: billingOversightQuery.isLoading,
        wards: wardsQuery.isLoading,
        beds: bedsQuery.isLoading,
        admissions: admissionsQuery.isLoading,
        rosters: rostersQuery.isLoading,
        appointments: appointmentsQuery.isLoading,
    };

    const errorStates = {
        overview: overviewQuery.error ? 'Failed to load metrics.' : null,
        users: usersQuery.error ? 'Failed to load users.' : null,
        invites: invitesQuery.error ? 'Failed to load invites.' : null,
        applications: applicationsQuery.error ? 'Failed to load applications.' : null,
        audits: auditsQuery.error ? 'Failed to load audit logs.' : null,
        departments: departmentsQuery.error ? 'Failed to load departments.' : null,
        compliance: complianceQuery.error ? 'Failed to load PMDC compliance records.' : null,
        revenue: revenueQuery.error ? 'Failed to load revenue metrics.' : null,
        billingOversight: billingOversightQuery.error ? 'Failed to load billing oversight metrics.' : null,
        wards: wardsQuery.error ? 'Failed to load IPD wards.' : null,
        beds: bedsQuery.error ? 'Failed to load IPD beds.' : null,
        admissions: admissionsQuery.error ? 'Failed to load admission records.' : null,
        rosters: rostersQuery.error ? 'Failed to load duty rosters.' : null,
        appointments: appointmentsQuery.error ? 'Failed to load appointments.' : null,
    };

    const isSyncing = 
        overviewQuery.isFetching ||
        usersQuery.isFetching ||
        invitesQuery.isFetching ||
        applicationsQuery.isFetching ||
        auditsQuery.isFetching ||
        departmentsQuery.isFetching ||
        complianceQuery.isFetching ||
        revenueQuery.isFetching ||
        billingOversightQuery.isFetching ||
        wardsQuery.isFetching ||
        bedsQuery.isFetching ||
        admissionsQuery.isFetching ||
        rostersQuery.isFetching ||
        appointmentsQuery.isFetching;

    // --- Setters (Cache Updaters) ---
    const setOverview = useCallback((updater) => queryClient.setQueryData(['adminOverview'], updater), [queryClient]);
    const setUsers = useCallback((updater) => queryClient.setQueryData(['adminUsers'], updater), [queryClient]);
    const setInvites = useCallback((updater) => queryClient.setQueryData(['adminInvites'], updater), [queryClient]);
    const setApplications = useCallback((updater) => queryClient.setQueryData(['adminApplications'], updater), [queryClient]);
    const setAudits = useCallback((updater) => queryClient.setQueryData(['adminAudits'], updater), [queryClient]);
    const setDepartments = useCallback((updater) => queryClient.setQueryData(['departments'], updater), [queryClient]);
    const setCompliance = useCallback((updater) => queryClient.setQueryData(['adminCompliance'], updater), [queryClient]);
    const setRevenue = useCallback((updater) => queryClient.setQueryData(['adminRevenue'], updater), [queryClient]);
    const setBillingOversight = useCallback((updater) => queryClient.setQueryData(['adminBillingOversight'], updater), [queryClient]);
    const setWards = useCallback((updater) => queryClient.setQueryData(['adminWards'], updater), [queryClient]);
    const setBeds = useCallback((updater) => queryClient.setQueryData(['adminBeds'], updater), [queryClient]);
    const setAdmissions = useCallback((updater) => queryClient.setQueryData(['adminAdmissions'], updater), [queryClient]);
    const setRosters = useCallback((updater) => queryClient.setQueryData(['adminRosters'], updater), [queryClient]);
    const setAppointments = useCallback((updater) => queryClient.setQueryData(['adminAppointments'], updater), [queryClient]);

    // --- Individual Refresher Functions ---
    const refreshOverview = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminOverview'] }), [queryClient]);
    const refreshUsers = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }), [queryClient]);
    const refreshInvites = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminInvites'] }), [queryClient]);
    const refreshApplications = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminApplications'] }), [queryClient]);
    const refreshAudits = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminAudits'] }), [queryClient]);
    const refreshDepartments = useCallback(() => queryClient.invalidateQueries({ queryKey: ['departments'] }), [queryClient]);
    const refreshCompliance = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminCompliance'] }), [queryClient]);
    const refreshRevenue = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminRevenue'] }), [queryClient]);
    const refreshBillingOversight = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminBillingOversight'] }), [queryClient]);
    const refreshWards = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminWards'] }), [queryClient]);
    const refreshBeds = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminBeds'] }), [queryClient]);
    const refreshAdmissions = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminAdmissions'] }), [queryClient]);
    const refreshRosters = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminRosters'] }), [queryClient]);
    const refreshAppointments = useCallback(() => queryClient.invalidateQueries({ queryKey: ['adminAppointments'] }), [queryClient]);

    const refreshAll = useCallback(async () => {
        await queryClient.invalidateQueries();
    }, [queryClient]);

    // --- Save changes to localStorage cache in real time ---
    useEffect(() => {
        const hasData = (overview && overview.total_active_staff > 0) || 
                        (users && users.length > 0) || 
                        (invites && invites.length > 0) || 
                        (applications && applications.length > 0) || 
                        (audits && audits.length > 0) || 
                        (departments && departments.length > 0) || 
                        (compliance && compliance.length > 0) || 
                        (wards && wards.length > 0) || 
                        (rosters && rosters.length > 0) || 
                        (appointments && appointments.length > 0);

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
