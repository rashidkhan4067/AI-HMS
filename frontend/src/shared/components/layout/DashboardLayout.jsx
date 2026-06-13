import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
    Box, CssBaseline, IconButton, List, ListItem, 
    ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, 
    Divider, Avatar, Popover, Badge, Chip, Breadcrumbs, Link, Tooltip, useMediaQuery, Button,
    LinearProgress, SpeedDial, SpeedDialAction
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { HelpCircle, Plus } from 'lucide-react';

import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 260;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? '#161D1D' : '#FFFFFF',
    borderRight: `1px solid ${theme.palette.divider}`,
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(9),
    backgroundColor: theme.palette.mode === 'dark' ? '#161D1D' : '#FFFFFF',
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
})(({ theme, open, isMobile }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: theme.palette.mode === 'dark' ? '#121717' : '#FFFFFF',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    ...(!isMobile && open && {
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

export const DashboardLayout = ({ 
    navItems = [], 
    onLogout,
    isSyncing = false,
    notifications = [],
    speedDialActions = [],
    searchConfig = null,
    roleLabel = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mode, toggleThemeMode } = useThemeMode();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default open drawer on desktop, closed on mobile
    const [open, setOpen] = useState(!isMobile);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElProfile, setAnchorElProfile] = useState(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState(null);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };

    const handleProfileClick = (event) => setAnchorElProfile(event.currentTarget);
    const handleProfileClose = () => setAnchorElProfile(null);

    const handleNotificationsClick = (event) => setAnchorElNotifications(event.currentTarget);
    const handleNotificationsClose = () => setAnchorElNotifications(null);

    const roleLabelMap = {
        'ADMIN': 'System Administrator',
        'DOCTOR': 'Doctor / Clinician',
        'NURSE': 'Nursing Lead & Care Staff',
        'RECEPTIONIST': 'Operations / Receptionist',
        'PHARMACIST': 'Dispensary / Pharmacist',
        'LAB_TECHNICIAN': 'Laboratory Technician',
        'RADIOLOGIST': 'Radiologist',
        'PATIENT': 'Patient Portal'
    };

    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const nameMap = {
            admin: 'Admin Console',
            dashboard: 'Workspace Overview',
            doctor: 'Doctor Workspace',
            nurse: 'Nurse Workspace',
            receptionist: 'Reception Workspace',
            reception: 'Reception Workspace',
            pharmacist: 'Pharmacist Workspace',
            pharmacy: 'Pharmacy Workspace',
            lab: 'Laboratory Portal',
            radiology: 'Radiology Portal',
            patient: 'Patient Portal',
            profile: 'Profile Settings',
            invites: 'Staff Onboarding',
            applications: 'Doctor Reviews',
            departments: 'Clinical Departments',
            users: 'Active Directories',
            audits: 'Security Logs',
        };

        const homePath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

        return (
            <Breadcrumbs aria-label="breadcrumb" sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Link component={RouterLink} to={homePath} underline="hover" color="inherit" sx={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalHospitalIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <span>AI-HMS</span>
                </Link>
                {paths.map((path, idx) => {
                    const to = `/${paths.slice(0, idx + 1).join('/')}`;
                    const isLast = idx === paths.length - 1;
                    const label = nameMap[path] || path.toUpperCase();

                    return isLast ? (
                        <Typography key={to} sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
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

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'inherit' }}>
            <DrawerHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pl: 1.5 }}>
                    <LocalHospitalIcon color="primary" sx={{ fontSize: 26 }} />
                    {(open || isMobile) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.1, fontFamily: "'Outfit', sans-serif" }}>
                                Al Shifaa
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'text.secondary' }}>
                                {user?.role === 'ADMIN' ? 'Admin Console' : 'HMS Portal'}
                            </Typography>
                        </Box>
                    )}
                </Box>
                {!isMobile && (
                    <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.secondary' }}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                )}
            </DrawerHeader>
            <Divider />

            <List sx={{ px: 0, py: 1.5, flexGrow: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                selected={isActive}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: (open || isMobile) ? 'initial' : 'center',
                                    px: 2.5,
                                    py: 1.25,
                                    borderRadius: '0 24px 24px 0',
                                    mr: (open || isMobile) ? 1.5 : 0,
                                    borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                    bgcolor: isActive 
                                        ? (theme.palette.mode === 'dark' ? 'rgba(156,241,240,0.06)' : 'rgba(0, 106, 106, 0.05)')
                                        : 'transparent',
                                    color: isActive ? 'primary.main' : 'text.primary',
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(156,241,240,0.06)' : 'rgba(0, 106, 106, 0.05)',
                                        color: 'primary.main',
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(156,241,240,0.08)' : 'rgba(0, 106, 106, 0.08)',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0, 0, 0, 0.03)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: (open || isMobile) ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    sx={{ opacity: (open || isMobile) ? 1 : 0 }} 
                                    slotProps={{
                                        primary: {
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '14px',
                                            fontFamily: "'DM Sans', sans-serif"
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />
            <List sx={{ px: 0, py: 1 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={onLogout}
                        sx={{
                            minHeight: 48,
                            justifyContent: (open || isMobile) ? 'initial' : 'center',
                            px: 2.5,
                            borderRadius: '0 24px 24px 0',
                            mr: (open || isMobile) ? 1.5 : 0,
                            color: 'error.main',
                            borderLeft: '4px solid transparent',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.05)' : 'rgba(186, 26, 26, 0.03)',
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: (open || isMobile) ? 2 : 'auto',
                                justifyContent: 'center',
                                color: 'error.main',
                            }}
                        >
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Logout Session" 
                            sx={{ opacity: (open || isMobile) ? 1 : 0 }} 
                            slotProps={{ 
                                primary: { 
                                    fontWeight: 600, 
                                    fontSize: '14px',
                                    fontFamily: "'DM Sans', sans-serif" 
                                } 
                            }} 
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: mode === 'dark' ? '#121717' : '#F8F9FA' }}>
            <CssBaseline />

            {/* Top Bar Header */}
            <CustomAppBar position="fixed" open={open} isMobile={isMobile} elevation={0}>
                {isSyncing && (
                    <LinearProgress 
                        color="primary" 
                        sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            height: '2px',
                            zIndex: 1301
                        }} 
                    />
                )}
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
                    {isMobile && isSearchExpanded && searchConfig ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            width: '100%', 
                            gap: 1.5 
                        }}>
                            <IconButton 
                                onClick={() => setIsSearchExpanded(false)} 
                                color="inherit"
                                sx={{ p: 1 }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5, 
                                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F3F4',
                                px: 2, 
                                py: 0.75, 
                                borderRadius: '8px', 
                                flexGrow: 1,
                                border: '1px solid transparent',
                                transition: 'all 0.15s ease',
                                '&:focus-within': {
                                    bgcolor: mode === 'dark' ? '#242C2C' : '#FFFFFF',
                                    borderColor: 'primary.main',
                                    boxShadow: '0 1px 3px rgba(60,64,67,0.15)'
                                }
                            }}>
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <input 
                                    type="text" 
                                    placeholder={searchConfig.placeholder} 
                                    value={searchConfig.value}
                                    onChange={searchConfig.onChange}
                                    style={{ 
                                        border: 'none', 
                                        background: 'transparent', 
                                        outline: 'none', 
                                        width: '100%', 
                                        fontSize: '13.5px', 
                                        color: 'inherit',
                                        fontFamily: "'DM Sans', sans-serif" 
                                    }}
                                    autoFocus
                                />
                            </Box>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerToggle}
                                    edge="start"
                                    sx={{ mr: 2, ...(!isMobile && open && { display: 'none' }) }}
                                >
                                    <MenuIcon />
                                </IconButton>

                                {/* Breadcrumbs */}
                                {getBreadcrumbs()}
                            </Box>

                            {/* Central Search Bar */}
                            {searchConfig && (
                                <Box sx={{ 
                                    display: { xs: 'none', md: 'flex' }, 
                                    alignItems: 'center', 
                                    gap: 1.5, 
                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F3F4',
                                    px: 2, 
                                    py: 0.75, 
                                    borderRadius: '8px', 
                                    width: '400px',
                                    border: '1px solid transparent',
                                    transition: 'all 0.15s ease',
                                    '&:focus-within': {
                                        bgcolor: mode === 'dark' ? '#242C2C' : '#FFFFFF',
                                        borderColor: 'primary.main',
                                        boxShadow: '0 1px 3px rgba(60,64,67,0.15)'
                                    }
                                }}>
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    <input 
                                        type="text" 
                                        placeholder={searchConfig.placeholder} 
                                        value={searchConfig.value}
                                        onChange={searchConfig.onChange}
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent', 
                                            outline: 'none', 
                                            width: '100%', 
                                            fontSize: '13.5px', 
                                            color: 'inherit',
                                            fontFamily: "'DM Sans', sans-serif" 
                                        }} 
                                    />
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {/* Search Toggle Button for Mobile */}
                                {isMobile && searchConfig && (
                                    <Tooltip title="Search">
                                        <IconButton onClick={() => setIsSearchExpanded(true)} color="inherit">
                                            <SearchIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {/* Theme Switcher */}
                                <Tooltip title="Toggle light/dark theme">
                                    <IconButton onClick={toggleThemeMode} color="inherit">
                                        {mode === 'dark' ? (
                                            <LightModeIcon sx={{ color: '#ffb400', fontSize: 20 }} />
                                        ) : (
                                            <DarkModeIcon sx={{ color: '#5f6368', fontSize: 20 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>

                                {/* Help Desk Icon */}
                                <Tooltip title="System Help Center">
                                    <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                                        <HelpCircle size={20} style={{ color: theme.palette.text.secondary }} />
                                    </IconButton>
                                </Tooltip>

                                {/* Notification Bell */}
                                {notifications && notifications.length > 0 && (
                                    <Tooltip title="Notifications & Alerts">
                                        <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationsClick}>
                                            <Badge badgeContent={notifications.length} color="error" variant="dot">
                                                <NotificationsIcon sx={{ fontSize: 20 }} />
                                            </Badge>
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {/* User profile dropdown button */}
                                <Box 
                                    onClick={handleProfileClick}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1, 
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                                        pl: 0.5, py: 0.5, pr: 1,
                                        borderRadius: '100px',
                                        transition: 'background-color 0.2s',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFFFFF'
                                    }}
                                >
                                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '12.5px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                        {getInitials(user?.full_name)}
                                    </Avatar>
                                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: '18px' }} />
                                </Box>
                            </Box>
                        </>
                    )}
                </Toolbar>
            </CustomAppBar>

            {/* Sidebar Drawer */}
            {isMobile ? (
                <MuiDrawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: mode === 'dark' ? '#161D1D' : '#FFFFFF',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                        },
                    }}
                >
                    {drawerContent}
                </MuiDrawer>
            ) : (
                <CustomDrawer variant="permanent" open={open}>
                    {drawerContent}
                </CustomDrawer>
            )}

            {/* Main Outlet Workspace */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2.5, sm: 4, md: 5 }, 
                    width: '100%', 
                    overflowX: 'hidden'
                }}
            >
                <DrawerHeader />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <Box sx={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                            <Outlet />
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Notifications Popover */}
            {notifications && notifications.length > 0 && (
                <Popover
                    open={!!anchorElNotifications}
                    anchorEl={anchorElNotifications}
                    onClose={handleNotificationsClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                        paper: {
                            sx: { mt: 1.5, width: 340, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
                        }
                    }}
                >
                    <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Notifications</Typography>
                        <Chip label={`${notifications.length} alerts`} color="primary" size="small" sx={{ fontSize: '10px', height: '18px', fontWeight: 600 }} />
                    </Box>
                    <Divider />
                    <List sx={{ p: 0 }}>
                        {notifications.map((notif) => (
                            <React.Fragment key={notif.id}>
                                <ListItemButton sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box sx={{ 
                                        p: 1, borderRadius: '8px', 
                                        bgcolor: notif.type === 'security' ? 'rgba(186, 26, 26, 0.08)' : 'rgba(0, 106, 106, 0.08)',
                                        color: notif.type === 'security' ? 'error.main' : 'primary.main',
                                        display: 'flex', alignItems: 'center' 
                                    }}>
                                        {notif.icon}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
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
                            </React.Fragment>
                        ))}
                    </List>
                </Popover>
            )}

            {/* Google Account Style Popover */}
            <Popover
                anchorEl={anchorElProfile}
                open={!!anchorElProfile}
                onClose={handleProfileClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: { 
                            mt: 1.5, 
                            width: 310, 
                            borderRadius: '24px', 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                            p: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? '#161D1D' : '#FFFFFF'
                        }
                    }
                }}
            >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, fontFamily: "'DM Sans', sans-serif" }}>
                    {user?.email}
                </Typography>
                <Avatar 
                    sx={{ 
                        width: 72, 
                        height: 72, 
                        bgcolor: 'primary.main', 
                        fontSize: '28px', 
                        fontWeight: 700, 
                        mb: 1.5,
                        fontFamily: "'Outfit', sans-serif",
                        boxShadow: '0 2px 8px rgba(0, 106, 106, 0.2)' 
                    }}
                >
                    {getInitials(user?.full_name)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25, fontFamily: "'Outfit', sans-serif" }}>
                    {user?.full_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {roleLabel || roleLabelMap[user?.role] || user?.role}
                </Typography>
                
                <Button 
                    variant="outlined" 
                    onClick={() => { handleProfileClose(); navigate(user?.role === 'ADMIN' ? '/admin/profile' : '/profile'); }}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        borderColor: 'divider',
                        color: 'text.primary',
                        fontSize: '13px',
                        px: 3,
                        py: 0.75,
                        mb: 2,
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'divider'
                        }
                    }}
                >
                    Manage Account Settings
                </Button>
                
                <Divider sx={{ width: '100%', mb: 1.5 }} />
                
                <Button 
                    variant="text" 
                    onClick={() => { handleProfileClose(); onLogout(); }}
                    color="error" 
                    startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                    sx={{ 
                        width: '100%', 
                        py: 1.25, 
                        borderRadius: '12px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        justifyContent: 'center',
                        fontSize: '13px',
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.05)' : 'rgba(186, 26, 26, 0.03)',
                        }
                    }}
                >
                    Sign out of session
                </Button>
            </Popover>

            {/* SpeedDial Action FAB on Mobile */}
            {isMobile && speedDialActions && speedDialActions.length > 0 && (
                <SpeedDial
                    ariaLabel="Shortcut Actions"
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        right: 24,
                        zIndex: 1100,
                        '& .MuiFab-primary': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            }
                        }
                    }}
                    icon={<Plus size={24} />}
                >
                    {speedDialActions.map((act, index) => (
                        <SpeedDialAction
                            key={index}
                            icon={act.icon}
                            tooltipTitle={act.name}
                            tooltipOpen
                            onClick={act.action}
                        />
                    ))}
                </SpeedDial>
            )}
        </Box>
    );
};

export default DashboardLayout;
