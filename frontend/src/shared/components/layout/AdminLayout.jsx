import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
    Box, CssBaseline, IconButton, List, ListItem, 
    ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, 
    Divider, Badge, Menu, MenuItem, Avatar, Popover,
    Breadcrumbs, Link, Chip, Tooltip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AlertTriangleIcon from '@mui/icons-material/ReportProblem';

import MailIcon from '@mui/icons-material/Mail';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { adminNavigation } from '../../../app/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 260;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? '#181F1F' : '#FFFFFF',
    borderRight: `1px solid ${theme.palette.divider}`,
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(9),
    backgroundColor: theme.palette.mode === 'dark' ? '#181F1F' : '#FFFFFF',
    borderRight: `1px solid ${theme.palette.divider}`,
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const CustomAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? '#0F1515' : '#F4FBFB',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const CustomDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export const AdminLayout = () => {
    const theme = useTheme();
    const { mode, toggleThemeMode } = useThemeMode();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [open, setOpen] = useState(true);
    const [anchorElProfile, setAnchorElProfile] = useState(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState(null);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    // Profile menu handlers
    const handleProfileClick = (event) => setAnchorElProfile(event.currentTarget);
    const handleProfileClose = () => setAnchorElProfile(null);

    // Notifications popover handlers
    const handleNotificationsClick = (event) => setAnchorElNotifications(event.currentTarget);
    const handleNotificationsClose = () => setAnchorElNotifications(null);

    // Dynamic breadcrumb resolver
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const nameMap = {
            admin: 'Admin Console',
            dashboard: 'System Overview',
            invites: 'Staff Onboarding',
            applications: 'Doctor Reviews',
            users: 'Active Directories',
            audits: 'Security Logs',
            profile: 'Account Settings'
        };

        return (
            <Breadcrumbs aria-label="breadcrumb" sx={{ display: { xs: 'none', md: 'block' } }}>
                <Link component={RouterLink} to="/admin/dashboard" underline="hover" color="inherit" sx={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalHospitalIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <span>AI-HMS</span>
                </Link>
                {paths.map((path, idx) => {
                    const to = `/${paths.slice(0, idx + 1).join('/')}`;
                    const isLast = idx === paths.length - 1;
                    const label = nameMap[path] || path.toUpperCase();

                    return isLast ? (
                        <Typography key={to} sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 600 }}>
                            {label}
                        </Typography>
                    ) : (
                        <Link key={to} component={RouterLink} to={to} underline="hover" color="inherit" sx={{ fontSize: '13px' }}>
                            {label}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        );
    };

    const mockNotifications = [
        { id: 1, title: 'New Application Pending', desc: 'Dr. Alice Carter applied for Cardiology', type: 'application', time: '10m ago', icon: <LocalHospitalIcon fontSize="small" /> },
        { id: 2, title: 'Security Warning', desc: '5 failed login attempts from 203.0.113.5', type: 'security', time: '1h ago', icon: <AlertTriangleIcon fontSize="small" /> },
        { id: 3, title: 'Invitation Generated', desc: 'Staff invite sent to doctor.smith@alshifaa.com', type: 'invite', time: '2h ago', icon: <MailIcon fontSize="small" /> }
    ];

    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: mode === 'dark' ? '#0F1515' : '#F4FBFB' }}>
            <CssBaseline />

            {/* Top Bar Header */}
            <CustomAppBar position="fixed" open={open} elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Breadcrumbs */}
                    {getBreadcrumbs()}

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Theme Switcher */}
                    <Tooltip title="Toggle light/dark theme">
                        <IconButton onClick={toggleThemeMode} color="inherit" sx={{ mr: 1 }}>
                            {mode === 'dark' ? (
                                <LightModeIcon sx={{ color: '#ffb400' }} />
                            ) : (
                                <DarkModeIcon sx={{ color: '#42474e' }} />
                            )}
                        </IconButton>
                    </Tooltip>

                    {/* Notification Bell */}
                    <Tooltip title="View security and onboarding alerts">
                        <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationsClick}>
                            <Badge badgeContent={mockNotifications.length} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User profile dropdown button */}
                    <Box 
                        onClick={handleProfileClick}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.85 },
                            pl: 1, py: 0.5, pr: 1.5,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFFFFF'
                        }}
                    >
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '12px', fontWeight: 600 }}>
                            {getInitials(user?.full_name || 'System Admin')}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.1 }}>
                                {user?.full_name || 'Rashid Khan'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', mt: 0.25 }}>
                                System Administrator
                            </Typography>
                        </Box>
                        <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: '18px' }} />
                    </Box>
                </Toolbar>
            </CustomAppBar>

            {/* Collapsible Navigation Left Sidebar */}
            <CustomDrawer variant="permanent" open={open}>
                <DrawerHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 1.5 }}>
                        <LocalHospitalIcon color="primary" sx={{ fontSize: 28 }} />
                        {open && (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                    Al Shifaa
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'text.secondary' }}>
                                    Management
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <IconButton onClick={handleDrawerClose} sx={{ color: 'text.secondary' }}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />

                {/* Navigation Links */}
                <List sx={{ px: 1, py: 1.5 }}>
                    {adminNavigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    selected={isActive}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        borderRadius: '12px',
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.light',
                                            color: 'primary.dark',
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 2 : 'auto',
                                            justifyContent: 'center',
                                            color: isActive ? 'primary.dark' : 'primary.main',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.text} 
                                        sx={{ opacity: open ? 1 : 0 }} 
                                        slotProps={{
                                            primary: {
                                                fontWeight: isActive ? 600 : 400,
                                                fontSize: '14px'
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ flexGrow: 1 }} />
                <Divider />

                {/* Logout Button */}
                <List sx={{ px: 1, py: 1 }}>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={logout}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                borderRadius: '12px',
                                color: 'error.main'
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                    color: 'error.main',
                                }}
                            >
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} slotProps={{ primary: { fontWeight: 600, fontSize: '14px' } }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </CustomDrawer>

            {/* Main Outlet Workspace */}
            <Box component="main" sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <DrawerHeader />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        <Box sx={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                            <Outlet />
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Notifications Popover */}
            <Popover
                open={!!anchorElNotifications}
                anchorEl={anchorElNotifications}
                onClose={handleNotificationsClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: { mt: 1.5, width: 340, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                    }
                }}
            >
                <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications Feed</Typography>
                    <Chip label="New" color="primary" size="small" sx={{ fontSize: '10px', height: '18px' }} />
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                    {mockNotifications.map((notif, idx) => (
                        <React.Fragment key={notif.id}>
                            <ListItemButton sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    p: 1, borderRadius: '10px', 
                                    bgcolor: notif.type === 'security' ? 'rgba(186, 26, 26, 0.08)' : 'rgba(0, 106, 106, 0.08)',
                                    color: notif.type === 'security' ? 'error.main' : 'primary.main',
                                    display: 'flex', alignItems: 'center' 
                                }}>
                                    {notif.icon}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                                        {notif.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
                                        {notif.desc}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '9px', fontWeight: 600, mt: 0.5 }}>
                                        {notif.time}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                            {idx < mockNotifications.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Popover>

            {/* Profile Menu Dropdown */}
            <Menu
                anchorEl={anchorElProfile}
                open={!!anchorElProfile}
                onClose={handleProfileClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: { mt: 1.5, minWidth: 200, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                    }
                }}
            >
                <MenuItem onClick={() => { handleProfileClose(); navigate('/admin/profile'); }} sx={{ py: 1.5, gap: 1.5 }}>
                    <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>My Profile settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleProfileClose(); logout(); }} sx={{ py: 1.5, gap: 1.5, color: 'error.main' }}>
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Sign out session</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};
export default AdminLayout;
