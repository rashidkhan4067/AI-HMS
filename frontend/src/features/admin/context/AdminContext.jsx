import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

const AdminContext = createContext(null);

const getCachedData = () => {
    try {
        const cached = localStorage.getItem('alshifaa_admin_cache');
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        console.error("Error reading admin cache:", e);
        return null;
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

    const hasCache = !!cached;
    const initialLoading = !hasCache;

    const [loadingStates, setLoadingStates] = useState({
        overview: initialLoading,
        users: initialLoading,
        invites: initialLoading,
        applications: initialLoading,
        audits: initialLoading,
    });

    const [isSyncing, setIsSyncing] = useState(false);

    const [errorStates, setErrorStates] = useState({
        overview: null,
        users: null,
        invites: null,
        applications: null,
        audits: null,
    });

    const refreshOverview = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, overview: true }));
        setErrorStates(prev => ({ ...prev, overview: null }));
        try {
            const data = await adminApi.getOverview();
            setOverview(data);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, overview: 'Failed to load metrics.' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, overview: false }));
        }
    }, []);

    const refreshUsers = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, users: true }));
        setErrorStates(prev => ({ ...prev, users: null }));
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, users: 'Failed to load users.' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, users: false }));
        }
    }, []);

    const refreshInvites = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, invites: true }));
        setErrorStates(prev => ({ ...prev, invites: null }));
        try {
            const data = await adminApi.getInvites();
            setInvites(data);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, invites: 'Failed to load invites.' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, invites: false }));
        }
    }, []);

    const refreshApplications = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, applications: true }));
        setErrorStates(prev => ({ ...prev, applications: null }));
        try {
            const data = await adminApi.getApplications();
            setApplications(data);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, applications: 'Failed to load applications.' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, applications: false }));
        }
    }, []);

    const refreshAudits = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, audits: true }));
        setErrorStates(prev => ({ ...prev, audits: null }));
        try {
            const data = await adminApi.getAudits();
            setAudits(data.results || data);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, audits: 'Failed to load audit logs.' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, audits: false }));
        }
    }, []);

    const refreshAll = useCallback(async (forceLoading = false) => {
        const cachedData = getCachedData();
        const shouldLoad = forceLoading || !cachedData;

        if (shouldLoad) {
            setLoadingStates({
                overview: true,
                users: true,
                invites: true,
                applications: true,
                audits: true,
            });
        }
        setIsSyncing(true);
        setErrorStates({
            overview: null,
            users: null,
            invites: null,
            applications: null,
            audits: null,
        });

        try {
            const data = await adminApi.getDashboardData();
            setOverview(data.overview);
            setUsers(data.users);
            setInvites(data.invites);
            setApplications(data.applications);
            setAudits(data.audits);
        } catch (err) {
            console.error("Composite endpoint failed, falling back to parallel fetches:", err);
            // Fallback: Fire all requests concurrently
            let overviewRes, usersRes, invitesRes, appsRes, auditsRes;
            
            const results = await Promise.allSettled([
                adminApi.getOverview().then(res => { overviewRes = res; setOverview(res); }),
                adminApi.getUsers().then(res => { usersRes = res; setUsers(res); }),
                adminApi.getInvites().then(res => { invitesRes = res; setInvites(res); }),
                adminApi.getApplications().then(res => { appsRes = res; setApplications(res); }),
                adminApi.getAudits().then(res => { 
                    const list = res.results || res;
                    auditsRes = list;
                    setAudits(list); 
                }),
            ]);

            // Set individual errors
            if (results[0].status === 'rejected') setErrorStates(prev => ({ ...prev, overview: 'Failed to load stats' }));
            if (results[1].status === 'rejected') setErrorStates(prev => ({ ...prev, users: 'Failed to load users' }));
            if (results[2].status === 'rejected') setErrorStates(prev => ({ ...prev, invites: 'Failed to load invites' }));
            if (results[3].status === 'rejected') setErrorStates(prev => ({ ...prev, applications: 'Failed to load applications' }));
            if (results[4].status === 'rejected') setErrorStates(prev => ({ ...prev, audits: 'Failed to load audits' }));
        } finally {
            setLoadingStates({
                overview: false,
                users: false,
                invites: false,
                applications: false,
                audits: false,
            });
            setIsSyncing(false);
        }
    }, []);

    // Load everything on mount
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Save changes to localStorage cache in real time
    useEffect(() => {
        const hasData = overview.total_active_staff > 0 || users.length > 0 || invites.length > 0 || applications.length > 0 || audits.length > 0;
        if (hasData) {
            try {
                localStorage.setItem('alshifaa_admin_cache', JSON.stringify({
                    overview,
                    users,
                    invites,
                    applications,
                    audits,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error("Error writing admin cache:", e);
            }
        }
    }, [overview, users, invites, applications, audits]);

    return (
        <AdminContext.Provider value={{
            overview,
            users,
            invites,
            applications,
            audits,
            loadingStates,
            errorStates,
            isSyncing,
            refreshOverview,
            refreshUsers,
            refreshInvites,
            refreshApplications,
            refreshAudits,
            refreshAll,
            setUsers,
            setInvites,
            setApplications,
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
