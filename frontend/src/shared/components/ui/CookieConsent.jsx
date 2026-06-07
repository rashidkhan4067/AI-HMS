import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Typography, Switch, Collapse, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, ShieldCheck, X } from 'lucide-react';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);
    const [prefs, setPrefs] = useState({
        essential: true,
        analytics: true,
        marketing: false
    });

    const location = useLocation();

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        const allowedPaths = ['/', '/login', '/auth/login'];
        
        if (!consent && allowedPaths.includes(location.pathname)) {
            // Show after a brief delay for a premium entrance effect
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [location.pathname]);

    const handleAcceptAll = () => {
        const consentData = {
            accepted: true,
            choices: { essential: true, analytics: true, marketing: true },
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('cookie_consent', JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        const consentData = {
            accepted: false,
            choices: { essential: true, analytics: false, marketing: false },
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('cookie_consent', JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        const consentData = {
            accepted: true,
            choices: prefs,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('cookie_consent', JSON.stringify(consentData));
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <Box
                    component={motion.div}
                    key="cookie-consent-popup"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 10000,
                        maxWidth: 420,
                        width: 'calc(100% - 48px)',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 106, 106, 0.12)',
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(22, 29, 29, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                        p: 3,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 106, 106, 0.1)',
                                color: '#006A6A',
                                flexShrink: 0
                            }}
                        >
                            <Cookie size={24} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    color: (theme) => theme.palette.mode === 'dark' ? '#E0F2F1' : '#161D1D',
                                    mb: 0.5
                                }}
                            >
                                Cookie Preferences
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    color: 'text.secondary',
                                    fontSize: '13px',
                                    lineHeight: 1.5
                                }}
                            >
                                We use cookies to enhance security, personalize your experience, and analyze site metrics. No patient health data is stored in cookies.
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={handleRejectAll}
                            sx={{ color: 'text.disabled', mt: -0.5, mr: -0.5 }}
                        >
                            <X size={18} />
                        </IconButton>
                    </Box>

                    <Collapse in={showPrefs}>
                        <Box
                            sx={{
                                borderTop: '1px solid',
                                borderBottom: '1px solid',
                                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                                py: 2,
                                mb: 2.5,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5
                            }}
                        >
                            {/* Essential */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ pr: 2 }}>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                                        Essential Cookies
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'text.secondary' }}>
                                        Required for system security and basic operations.
                                    </Typography>
                                </Box>
                                <Switch size="small" checked disabled />
                            </Box>

                            {/* Analytics */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ pr: 2 }}>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                                        Analytics Cookies
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'text.secondary' }}>
                                        Helps us monitor site performance and diagnostics.
                                    </Typography>
                                </Box>
                                <Switch
                                    size="small"
                                    checked={prefs.analytics}
                                    onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#006A6A' },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#006A6A' }
                                    }}
                                />
                            </Box>

                            {/* Marketing */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ pr: 2 }}>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                                        Personalization Cookies
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'text.secondary' }}>
                                        Remembers layouts and custom interface settings.
                                    </Typography>
                                </Box>
                                <Switch
                                    size="small"
                                    checked={prefs.marketing}
                                    onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#006A6A' },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#006A6A' }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Collapse>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {showPrefs ? (
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSavePreferences}
                                startIcon={<ShieldCheck size={16} />}
                                sx={{
                                    background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(0, 106, 106, 0.2)',
                                    height: 38,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                    }
                                }}
                            >
                                Save Preferences
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => setShowPrefs(true)}
                                    startIcon={<Settings size={14} />}
                                    sx={{
                                        borderColor: 'rgba(0, 106, 106, 0.3)',
                                        color: '#006A6A',
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        height: 38,
                                        '&:hover': {
                                            borderColor: '#006A6A',
                                            backgroundColor: 'rgba(0, 106, 106, 0.04)'
                                        }
                                    }}
                                >
                                    Customize
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleAcceptAll}
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#F4F4F5' : '#1F2937',
                                        color: (theme) => theme.palette.mode === 'dark' ? '#18181B' : '#FFFFFF',
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        height: 38,
                                        '&:hover': {
                                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#E4E4E7' : '#111827',
                                        }
                                    }}
                                >
                                    Accept All
                                </Button>
                            </Box>
                        )}
                        {!showPrefs && (
                            <Button
                                fullWidth
                                variant="text"
                                onClick={handleRejectAll}
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontFamily: "'DM Sans', sans-serif",
                                    textDecoration: 'underline',
                                    py: 0.5,
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        color: 'text.primary',
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Reject optional cookies
                            </Button>
                        )}
                    </Box>
                </Box>
            )}
        </AnimatePresence>
    );
};
