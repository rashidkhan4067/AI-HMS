import React from 'react';
import { Box, Container, Typography, Button, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle2, UserCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

export const TermsPage = () => {
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
                            <FileText size={26} />
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
                                Terms of Service
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
                        Welcome to Al Shifaa Hospital Management System (AI-HMS). By accessing this platform, you agree to comply with the terms and conditions outlined below. This portal is strictly intended for clinical workflows, medical records auditing, and patient management.
                    </Typography>

                    <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

                    {/* Sections */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Section 1 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <CheckCircle2 size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    1. Acceptance & Authorization
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                Access to AI-HMS is granted exclusively to authorized personnel of Al Shifaa Hospital. Unauthorized attempts to bypass login screens, inspect medical endpoints, or access patient information without an assigned active shift are strictly forbidden and subject to administrative action.
                            </Typography>
                        </Box>

                        {/* Section 2 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <UserCheck size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    2. Staff Account Responsibility
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                You are responsible for keeping your credentials and active JWT sessions confidential. Login attempts are subject to locking thresholds. Sharing accounts or failing to notify administrators of security incidents is a breach of service guidelines.
                            </Typography>
                        </Box>

                        {/* Section 3 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <AlertTriangle size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    3. Patient Record Usage (PHI)
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                When reading or editing Patient Protected Health Information (PHI), you agree to comply with HIPAA policies and the minimum necessary standard. Any copy, download, or export of record files must be done exclusively through hospital-sanctioned channels.
                            </Typography>
                        </Box>

                        {/* Section 4 */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <AlertCircle size={18} color="#006A6A" />
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: isDark ? '#E0F2F1' : '#161D1D' }}>
                                    4. Termination of Session
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.7, pl: 4 }}>
                                AI-HMS reserves the right to automatically terminate user sessions, revoke access keys, or place lockout timer restrictions on accounts exhibiting abnormal network usage patterns or showing compliance indicators of credentials sharing.
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

                    {/* Footer Contact */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mb: 1 }}>
                            Have questions regarding system compliance terms?
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 700,
                                color: '#006A6A'
                            }}
                        >
                            legal@alshifaa-hms.org
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
