import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import ShieldIcon from '@mui/icons-material/Shield';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

/**
 * Global Navigation Configuration
 * Defines the sidebar links and their required roles.
 */
export const mainNavigation = [
    { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard',
        roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'PATIENT']
    },
    { 
        text: 'Profile', 
        icon: <PersonIcon />, 
        path: '/profile',
        roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'PATIENT']
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
        text: 'Financials',
        icon: <AttachMoneyIcon />,
        path: '/admin/revenue',
        roles: ['ADMIN']
    },
    {
        text: 'PMDC Compliance',
        icon: <AssignmentTurnedInIcon />,
        path: '/admin/compliance',
        roles: ['ADMIN']
    },
    {
        text: 'IPD Bed Grid',
        icon: <HotelIcon />,
        path: '/admin/ipd',
        roles: ['ADMIN']
    },
    {
        text: 'Duty Roster',
        icon: <CalendarMonthIcon />,
        path: '/admin/roster',
        roles: ['ADMIN']
    },
    {
        text: 'Appointments',
        icon: <CalendarTodayIcon />,
        path: '/admin/appointments',
        roles: ['ADMIN']
    },
    {
        text: 'Staff Onboarding',
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
        text: 'Departments',
        icon: <BusinessIcon />,
        path: '/admin/departments',
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

