import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, 
    ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

const drawerWidth = 240;

export const DashboardLayout = ({ navItems = [], onLogout }) => {
    const { mode, toggleThemeMode } = useThemeMode();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon color="primary" />
                <Typography variant="h6" color="primary" fontWeight="bold">AI-HMS</Typography>
            </Toolbar>
            <Divider />
            <List>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton 
                                onClick={() => navigate(item.path)}
                                selected={isActive}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.dark',
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? 'primary.dark' : 'primary.main' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    slotProps={{
                                        primary: {
                                            fontWeight: isActive ? 600 : 400
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={onLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon sx={{ color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.paper' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" fontWeight="500">
                        Hospital Portal
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={toggleThemeMode} color="inherit" sx={{ mr: 1 }}>
                        {mode === 'dark' ? (
                            <LightModeIcon sx={{ color: '#ffb400' }} />
                        ) : (
                            <DarkModeIcon sx={{ color: '#42474e' }} />
                        )}
                    </IconButton>
                </Toolbar>
            </AppBar>
            
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <Box sx={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};
