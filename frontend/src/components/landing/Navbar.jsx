import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '../../shared/components/ui/BrandLogo';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

export const Navbar = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Onboarding', href: '#how-it-works' },
        { label: 'For Hospitals', href: '#hospitals' },
        { label: 'For Patients', href: '#patients' },
        { label: 'Testimonials', href: '#testimonials' },
    ];

    const menuVars = {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    return (
        <Box
            component={motion.header}
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 3, md: 6 },
                backgroundColor: scrolled 
                    ? (isDark ? 'rgba(22, 29, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)')
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                boxShadow: scrolled 
                    ? (isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)')
                    : 'none',
                borderBottom: scrolled
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,106,106,0.08)'}`
                    : 'none',
                transition: 'background-color 0.3s, backdrop-filter 0.3s, box-shadow 0.3s, border-bottom 0.3s',
            }}
        >
            {/* Logo */}
            <RouterLink to="/" style={{ textDecoration: 'none' }}>
                <BrandLogo size={36} textColor={isDark ? '#E0F2F1' : '#006A6A'} />
            </RouterLink>

            {/* Desktop Navigation Links */}
            {!isMobile && (
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '14.5px',
                                fontWeight: 500,
                                color: isDark ? '#B2C7C7' : '#4A6363',
                                textDecoration: 'none',
                                transition: 'color 0.25s ease',
                                '&:hover': {
                                    color: '#006A6A',
                                },
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </Box>
            )}

            {/* Right Buttons / Hamburger */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {!isMobile && (
                    <>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="outlined"
                            sx={{
                                height: 38,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '13.5px',
                                borderColor: '#006A6A',
                                color: '#006A6A',
                                px: 2.5,
                                '&:hover': {
                                    borderColor: '#005858',
                                    backgroundColor: 'rgba(0, 106, 106, 0.04)',
                                },
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="contained"
                            sx={{
                                height: 38,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '13.5px',
                                background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                color: '#FFFFFF',
                                px: 2.5,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                },
                            }}
                        >
                            Get Started
                        </Button>
                    </>
                )}

                {/* Mobile Menu Icon */}
                {isMobile && (
                    <IconButton
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        sx={{ color: isDark ? '#E0F2F1' : '#006A6A' }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </IconButton>
                )}
            </Box>

            {/* Mobile Slide-down Menu */}
            <AnimatePresence>
                {isMobile && mobileMenuOpen && (
                    <Box
                        component={motion.div}
                        variants={menuVars}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        sx={{
                            position: 'absolute',
                            top: 64,
                            left: 0,
                            right: 0,
                            backgroundColor: isDark ? '#161D1D' : '#FFFFFF',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,106,106,0.08)'}`,
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            px: 3,
                            py: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            zIndex: 49,
                            overflow: 'hidden',
                        }}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    color: isDark ? '#B2C7C7' : '#4A6363',
                                    textDecoration: 'none',
                                    py: 0.5,
                                    display: 'block',
                                    '&:hover': {
                                        color: '#006A6A',
                                    },
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="outlined"
                                fullWidth
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    height: 40,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    borderColor: '#006A6A',
                                    color: '#006A6A',
                                    '&:hover': {
                                        borderColor: '#005858',
                                        backgroundColor: 'rgba(0, 106, 106, 0.04)',
                                    },
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/register"
                                variant="contained"
                                fullWidth
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    height: 40,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                    color: '#FFFFFF',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                    },
                                }}
                            >
                                Get Started
                            </Button>
                        </Box>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    );
};
