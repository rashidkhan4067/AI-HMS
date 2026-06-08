import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, Grid } from '@mui/material';
import { BrandLogo } from '../../shared/components/ui/BrandLogo';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

// Custom inline SVG icons for LinkedIn, Twitter, and GitHub
const LinkedinIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const GithubIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

export const Footer = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const platformLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Hospitals', href: '#hospitals' },
        { name: 'Patients', href: '#patients' }
    ];

    const userLinks = [
        { name: 'Patient Portal', to: '/login?type=patient', isRouter: true },
        { name: 'Doctor Portal', to: '/register?apply=doctor', isRouter: true },
        { name: 'Request Demo', to: '/register', isRouter: true }
    ];

    const complianceLinks = [
        { name: 'Privacy Policy', to: '/privacy', isRouter: true },
        { name: 'Terms of Use', to: '/terms', isRouter: true },
        { name: 'HIPAA Info', href: '#compliance' }
    ];

    return (
        <Box
            id="footer"
            component="footer"
            sx={{
                backgroundColor: isDark ? '#0B0F0F' : '#F4FBFB',
                color: isDark ? '#E0F2F1' : '#111717',
                pt: { xs: 5, md: 10 },
                pb: { xs: 4, md: 8 },
                px: { xs: 3, md: 6 },
                display: 'flex',
                justifyContent: 'center',
                borderTop: '1px solid',
                borderColor: isDark ? 'rgba(0, 106, 106, 0.15)' : 'rgba(0, 106, 106, 0.08)',
                transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 1280 }}>
                {/* 
                  Main grid container where each column is a direct child.
                  This ensures proper spacing and prevents horizontal compression on desktop sizes.
                */}
                <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mb: { xs: 4, md: 8 } }}>
                    {/* Brand Section */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-start' },
                            textAlign: { xs: 'center', md: 'left' }
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <BrandLogo size={36} textColor={isDark ? '#E0F2F1' : '#006A6A'} />
                        </Box>
                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: { xs: '13.5px', md: '14.5px' },
                                color: isDark ? '#B2C7C7' : '#4E5D5D',
                                mb: 3.5,
                                lineHeight: 1.6,
                                maxWidth: { xs: 290, md: 340 },
                            }}
                        >
                            Pakistan's leading unified clinical system orchestrating healthcare operations at scale.
                        </Typography>

                        {/* Social Icons */}
                        <Box sx={{ display: 'flex', gap: 1.5, color: isDark ? '#8A9F9F' : '#687878' }}>
                            {[
                                { icon: <LinkedinIcon size={16} />, href: 'https://linkedin.com' },
                                { icon: <TwitterIcon size={16} />, href: 'https://twitter.com' },
                                { icon: <GithubIcon size={16} />, href: 'https://github.com' }
                            ].map((social, idx) => (
                                <Box
                                    key={idx}
                                    component="a"
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        color: 'inherit',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.04)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.08)'}`,
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            color: isDark ? '#4DB6AC' : '#006A6A',
                                            backgroundColor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'rgba(0,106,106,0.08)',
                                            borderColor: isDark ? 'rgba(77, 182, 172, 0.3)' : 'rgba(0, 106, 106, 0.2)',
                                        }
                                    }}
                                >
                                    {social.icon}
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Platform Column */}
                    <Grid
                        item
                        xs={4}
                        md={2.5}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-start' }
                        }}
                    >
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: { xs: '12px', sm: '14px', md: '15.5px' }, color: isDark ? '#E0F2F1' : '#111717', mb: { xs: 2, md: 3 } }}>
                            Platform
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 1.75 }, alignItems: { xs: 'center', md: 'flex-start' } }}>
                            {platformLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    sx={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: { xs: '11.5px', sm: '13px', md: '13.8px' },
                                        color: isDark ? '#8A9F9F' : '#687878',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: isDark ? '#4DB6AC' : '#006A6A',
                                            transform: 'translateX(2px)'
                                        }
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Portals Column */}
                    <Grid
                        item
                        xs={4}
                        md={2.5}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-start' }
                        }}
                    >
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: { xs: '12px', sm: '14px', md: '15.5px' }, color: isDark ? '#E0F2F1' : '#111717', mb: { xs: 2, md: 3 } }}>
                            Portals
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 1.75 }, alignItems: { xs: 'center', md: 'flex-start' } }}>
                            {userLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    component={RouterLink}
                                    to={item.to}
                                    sx={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: { xs: '11.5px', sm: '13px', md: '13.8px' },
                                        color: isDark ? '#8A9F9F' : '#687878',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: isDark ? '#4DB6AC' : '#006A6A',
                                            transform: 'translateX(2px)'
                                        }
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Legal Column */}
                    <Grid
                        item
                        xs={4}
                        md={3}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-start' }
                        }}
                    >
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: { xs: '12px', sm: '14px', md: '15.5px' }, color: isDark ? '#E0F2F1' : '#111717', mb: { xs: 2, md: 3 } }}>
                            Legal
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 1.75 }, alignItems: { xs: 'center', md: 'flex-start' } }}>
                            {complianceLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    {...(item.isRouter ? { component: RouterLink, to: item.to } : { href: item.href })}
                                    sx={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: { xs: '11.5px', sm: '13px', md: '13.8px' },
                                        color: isDark ? '#8A9F9F' : '#687878',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: isDark ? '#4DB6AC' : '#006A6A',
                                            transform: 'translateX(2px)'
                                        }
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* Bottom Row */}
                <Box
                    sx={{
                        borderTop: '1px solid',
                        borderColor: isDark ? 'rgba(0, 106, 106, 0.15)' : 'rgba(0, 106, 106, 0.08)',
                        pt: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        textAlign: { xs: 'center', sm: 'left' }
                    }}
                >
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: { xs: '12.5px', md: '13.5px' }, color: isDark ? '#7A9292' : '#8C9E9E' }}>
                        &copy; {new Date().getFullYear()} Al Shifaa Health Systems. All rights reserved.
                    </Typography>
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: { xs: '12.5px', md: '13.5px' }, color: isDark ? '#7A9292' : '#8C9E9E', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Made in Pakistan 🇵🇰
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
