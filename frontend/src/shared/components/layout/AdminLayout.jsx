import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../../features/admin/context/AdminContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { adminNavigation } from '../../../app/navigation';
import { DashboardLayout } from './DashboardLayout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AlertTriangleIcon from '@mui/icons-material/ReportProblem';
import MailIcon from '@mui/icons-material/Mail';
import { RefreshCw } from 'lucide-react';

const AdminLayoutContent = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { isSyncing, refreshAll } = useAdmin();
    const [searchVal, setSearchVal] = useState('');

    const mockNotifications = [
        { id: 1, title: 'New Application Pending', desc: 'Dr. Alice Carter applied for Cardiology', type: 'application', time: '10m ago', icon: <LocalHospitalIcon fontSize="small" /> },
        { id: 2, title: 'Security Warning', desc: '5 failed login attempts from 203.0.113.5', type: 'security', time: '1h ago', icon: <AlertTriangleIcon fontSize="small" /> },
        { id: 3, title: 'Invitation Generated', desc: 'Staff invite sent to doctor.smith@alshifaa.com', type: 'invite', time: '2h ago', icon: <MailIcon fontSize="small" /> }
    ];

    const speedDialActions = [
        { icon: <MailIcon />, name: 'Issue Invitation', action: () => navigate('/admin/invites') },
        { icon: <LocalHospitalIcon />, name: 'Review Applications', action: () => navigate('/admin/applications') },
        { icon: <RefreshCw size={18} />, name: 'Sync Directory', action: () => refreshAll() }
    ];

    const searchConfig = {
        placeholder: "Search accounts, review applications, or audit logs...",
        value: searchVal,
        onChange: (e) => setSearchVal(e.target.value)
    };

    return (
        <DashboardLayout
            navItems={adminNavigation}
            onLogout={logout}
            isSyncing={isSyncing}
            notifications={mockNotifications}
            speedDialActions={speedDialActions}
            searchConfig={searchConfig}
            roleLabel="System Administrator"
        />
    );
};

export const AdminLayout = () => {
    return (
        <AdminProvider>
            <AdminLayoutContent />
        </AdminProvider>
    );
};

export default AdminLayout;
