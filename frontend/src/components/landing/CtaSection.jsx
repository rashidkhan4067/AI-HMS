import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const CtaSection = () => {
    return (
        <Box
            id="cta"
            sx={{
                py: { xs: 6, sm: 8, md: 12 },
                px: { xs: 2.5, sm: 4, md: 6 },
                background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 0), linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                backgroundSize: '24px 24px, 100% 100%',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 800,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                }}
            >
                {/* White Brand Logo Mark with subtle animation */}
                <Box 
                    component={motion.div}
                    animate={{ scale: [0.97, 1.03, 0.97] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    sx={{ mb: { xs: 2, md: 3.5 }, display: 'flex' }}
                >
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="16" y="4" width="16" height="40" rx="6" fill="#FFFFFF" fillOpacity="0.2" />
                        <rect x="4" y="16" width="40" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.2" />
                        <rect x="18.5" y="7" width="11" height="34" rx="4" fill="#FFFFFF" />
                        <rect x="7" y="18.5" width="34" height="11" rx="4" fill="#FFFFFF" />
                        <path 
                            d="M 12 24 L 20 24 L 22.5 17 L 25.5 31 L 28 21 L 30 24 L 36 24" 
                            stroke="#006A6A" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M32 14c-3.5 0-7 2.5-7.5 6 2.5-0.5 5.5 1 6.5 3.5 1-2.5 3.5-4 7-4 0-3.5-2.5-5.5-6-5.5z" 
                            fill="#A7FFEB" 
                        />
                    </svg>
                </Box>

                {/* Heading */}
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: { xs: '26px', sm: '34px', md: '40px' },
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mb: { xs: 1.5, md: 2 },
                        letterSpacing: '-0.8px',
                    }}
                >
                    Ready to Modernize Your Hospital?
                </Typography>

                {/* Subtitle */}
                <Typography
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: { xs: '14px', md: '16px' },
                        color: 'rgba(255, 255, 255, 0.75)',
                        mb: { xs: 3.5, md: 5 },
                        maxWidth: 600,
                        lineHeight: 1.55,
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                        Join Al Shifaa to experience efficient patient flows, EMR databases, and smart analytics. Set up in less than a week.
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                        Join Al Shifaa clinical network and experience efficient patient flow, medical audits, and smart analytics. Set up in less than a week.
                    </Box>
                </Typography>

                {/* CTA Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                        justifyContent: 'center',
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        sx={{
                            height: { xs: 44, sm: 48 },
                            px: 4,
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '14px', sm: '15px' },
                            backgroundColor: '#FFFFFF',
                            color: '#006A6A',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            '&:hover': {
                                backgroundColor: '#F9FAFB',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        <span>Request Institutional Access</span>
                        <ArrowRight size={16} />
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/login?type=patient"
                        variant="outlined"
                        sx={{
                            height: { xs: 44, sm: 48 },
                            px: 4,
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '14px', sm: '15px' },
                            border: '1.5px solid rgba(255, 255, 255, 0.4) !important',
                            color: '#FFFFFF',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            '&:hover': {
                                border: '1.5px solid rgba(255, 255, 255, 0.8) !important',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            },
                        }}
                    >
                        <span>Try Patient Portal</span>
                        <ArrowRight size={16} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
