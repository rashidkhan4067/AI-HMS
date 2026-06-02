import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Global Navigation Configuration
 * Defines the sidebar links and their required roles.
 */
export const mainNavigation = [
    { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard',
        roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']
    },
    { 
        text: 'Profile', 
        icon: <PersonIcon />, 
        path: '/profile',
        roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']
    },
];
