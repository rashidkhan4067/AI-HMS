import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import ShieldIcon from '@mui/icons-material/Shield';

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

export const adminNavigation = [
    {
        text: 'System Overview',
        icon: <DashboardIcon />,
        path: '/admin/dashboard',
        roles: ['ADMIN']
    },
    {
        text: 'Staff Invitations',
        icon: <MailIcon />,
        path: '/admin/invites',
        roles: ['ADMIN']
    },
    {
        text: 'Doctor Reviews',
        icon: <AssignmentIndIcon />,
        path: '/admin/applications',
        roles: ['ADMIN']
    },
    {
        text: 'Users Control',
        icon: <PeopleIcon />,
        path: '/admin/users',
        roles: ['ADMIN']
    },
    {
        text: 'Security Audits',
        icon: <ShieldIcon />,
        path: '/admin/audits',
        roles: ['ADMIN']
    }
];

