import React from 'react';
import { Box, Container, Typography, Button, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

export const PrivacyPage = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: isDark ? '#111616' : '#F4F7F6',
                py: 6,
                px: 2,
                transition: 'background-color 0.3s ease'
            }}
        >
            <Container maxWidth="md">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#006A6A',
                        textTransform: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        mb: 3,
                        '&:hover': {
                            backgroundColor: 'rgba(0, 106, 106, 0.08)'
                        }
                    }}
                >
                    Back
                </Button>

                {/* Main Content Card */}
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)',
                        backgroundColor: isDark ? 'rgba(22, 29, 29, 0.8)' : '#FFFFFF',
                        backdropFilter: 'blur(20px)',
                        boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,106,106,0.04)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 106, 106, 0.1)',
                                color: '#006A6A'
                            }}
                        >
                            <Shield size={26} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 700,
                                    fontSize: { xs: '22px', md: '28px' },
                                    color: isDark ? '#E0F2F1' : '#161D1D'
                                }}
                            >
                                Privacy Policy
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    color: 'text.disabled',
                                    fontWeight: 500
                                }}
                            >
                                Last Updated: June 2026 · Version 1.1
                            </Typography>
                        </Box>
                    </Box>

                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: 'text.secondary',
                            lineHeight: 1.7,
                            mb: 4,
                            fontSize: '15px'
                        }}
                    >
                        At Al Shifaa Hospital Management System (AI-HMS), we take patient and clinical data security extremely seriously. This Privacy Policy details how we handle, secure, and monitor personal and health-related data within our digital healthcare ecosystem.
                    </Typography>

                    <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

                    {/* Sections */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Section 1 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Eye size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    1. Information We Collect
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                We collect demographic information, credentials, and authentication logs for medical staff (Admins, Doctors, Nurses, etc.). For patients, our platform stores clinical diagnoses, vitals, care schedules, prescription details, and laboratory results necessary for operating clinical workspaces.
                            </Typography>
                        </Box>

                        {/* Section 2 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <FileText size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    2. Use of Information
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                Collected data is strictly used to facilitate healthcare workflows, including patient check-ins, EHR auditing, prescription dispensing, and clinical analytics. No personal identifier data is ever sold, leased, or distributed for commercial advertising purposes.
                            </Typography>
                        </Box>

                        {/* Section 3 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Lock size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    3. Data Security & Audits
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                We implement Role-Based Access Control (RBAC) and data encryption protocols (AES-256 at rest, TLS 1.3 in transit). Every login attempt, patient card access, and database action is logged within our secure audit trails to ensure HIPAA and local regulatory compliance.
                            </Typography>
                        </Box>

                        {/* Section 4 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Shield size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    4. Cookies & Custom Sessions
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                We use standard HttpOnly cookies strictly for maintaining user authentication state securely. These cookies prevent cross-site scripting (XSS) attacks by limiting access to browser scripts. You can adjust optional diagnostic cookies in the cookie preferences panel.
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

                    {/* Footer Contact */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mb: 1 }}>
                            Have questions regarding clinical data handling?
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 700,
                                color: '#006A6A'
                            }}
                        >
                            privacy@alshifaa-hms.org
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
