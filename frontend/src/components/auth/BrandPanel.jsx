import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck, Check, LockKeyhole, Mail, Shield } from 'lucide-react';

/* ─────────────────────────────────────────────
   Al Shifaa SVG Logo Mark
   ───────────────────────────────────────────── */
const AlShifaaLogo = ({ size = 40, white = false }) => {
    const primaryColor = white ? '#FFFFFF' : '#006A6A';
    const backingOpacity = white ? 0.22 : 0.12;
    const accentColor = white ? 'rgba(255, 255, 255, 0.75)' : '#4DB6AC';
    const waveColor = white ? '#004D40' : '#FFFFFF';

    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="4" width="16" height="40" rx="6" fill={primaryColor} fillOpacity={backingOpacity} />
            <rect x="4" y="16" width="40" height="16" rx="6" fill={primaryColor} fillOpacity={backingOpacity} />
            <rect x="18.5" y="7" width="11" height="34" rx="4" fill={primaryColor} />
            <rect x="7" y="18.5" width="34" height="11" rx="4" fill={primaryColor} />
            <path
                d="M 12 24 L 20 24 L 22.5 17 L 25.5 31 L 28 21 L 30 24 L 36 24"
                stroke={waveColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32 14c-3.5 0-7 2.5-7.5 6 2.5-0.5 5.5 1 6.5 3.5 1-2.5 3.5-4 7-4 0-3.5-2.5-5.5-6-5.5z"
                fill={accentColor}
            />
        </svg>
    );
};

/* ─────────────────────────────────────────────
   BrandPanel Component
   ───────────────────────────────────────────── */
export const BrandPanel = ({ variant = 'login' }) => {
    // 1. Get header text configuration per variant
    const getContentConfig = () => {
        switch (variant) {
            case 'register':
                return {
                    headline: "Join Pakistan's\nLeading HMS Network",
                    subtitle: "Set up your clinical workspace in minutes. Built for doctors, staff, and administrators.",
                };
            case 'forgot_password':
                return {
                    headline: "Account Recovery\nIs Simple & Secure",
                    subtitle: "We'll verify your identity and get you back into your workspace safely.",
                };
            case 'otp':
                return {
                    headline: "Two-Factor\nVerification Active",
                    subtitle: "This extra step keeps every patient record and clinical workflow protected.",
                };
            case 'reset_password':
                return {
                    headline: "Create a Strong\nNew Password",
                    subtitle: "Your new password will apply to all active sessions and devices immediately.",
                };
            case 'login':
            default:
                return {
                    headline: "Trusted Healthcare.\nSeamless Management.",
                    subtitle: "Enterprise-grade hospital operations platform built for Pakistan's leading clinical institutions.",
                };
        }
    };

    const config = getContentConfig();

    // 2. Render the swappable Middle Block slot
    const renderMidBlock = () => {
        switch (variant) {
            case 'register':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                            "Unified patient records across departments",
                            "AI-assisted appointment scheduling",
                            "Role-based access for every staff tier",
                            "Real-time ward and bed occupancy tracking"
                        ].map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                                <Check size={14} color="#5EEAD4" style={{ marginTop: '3.5px', flexShrink: 0 }} />
                                <Typography sx={{
                                    fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                    fontSize: '13.5px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    lineHeight: 1.4,
                                    fontWeight: 400,
                                }}>
                                    {item}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                );

            case 'forgot_password':
                return (
                    <Box sx={{
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    }}>
                        {[
                            { icon: LockKeyhole, text: "Reset link expires in 15 minutes" },
                            { icon: Mail, text: "Sent only to your registered email" },
                            { icon: ShieldCheck, text: "All sessions logged for audit compliance" }
                        ].map((row, idx, arr) => {
                            const Icon = row.icon;
                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        borderBottom: idx < arr.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                        pb: idx < arr.length - 1 ? 2 : 0,
                                    }}
                                >
                                    <Icon size={16} color="#5EEAD4" style={{ flexShrink: 0 }} />
                                    <Typography sx={{
                                        fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                        fontSize: '13.5px',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        lineHeight: 1.3,
                                    }}>
                                        {row.text}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                );

            case 'otp':
                return (
                    <Box sx={{
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        p: 2.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <ShieldCheck size={28} color="#5EEAD4" />
                            <Typography sx={{
                                fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                fontSize: '10.5px',
                                color: 'rgba(255, 255, 255, 0.40)',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                mt: 0.75,
                                fontWeight: 600,
                            }}>
                                WHY OTP?
                            </Typography>
                        </Box>
                        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontFamily: "'Segoe UI', 'Inter', sans-serif", fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>Code valid for</Typography>
                                <Typography sx={{ fontFamily: "'Segoe UI', 'Inter', sans-serif", fontSize: '13.5px', fontWeight: 500, color: '#FFFFFF' }}>30 seconds</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontFamily: "'Segoe UI', 'Inter', sans-serif", fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>6 digits</Typography>
                                <Typography sx={{ fontFamily: "'Segoe UI', 'Inter', sans-serif", fontSize: '13.5px', fontWeight: 500, color: '#FFFFFF' }}>One-time use</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', mt: 2, mb: 2 }} />
                        <Typography sx={{
                            fontFamily: "'Segoe UI', 'Inter', sans-serif",
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.40)',
                            textAlign: 'center',
                            lineHeight: 1.4,
                        }}>
                            Didn't receive it? Check spam or request a new code.
                        </Typography>
                    </Box>
                );

            case 'reset_password':
                return (
                    <Box sx={{
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        p: 2.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    }}>
                        <Typography sx={{
                            fontFamily: "'Segoe UI', 'Inter', sans-serif",
                            fontSize: '10.5px',
                            color: 'rgba(255, 255, 255, 0.40)',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            mb: 2,
                            fontWeight: 600,
                        }}>
                            Strong Password Checklist
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {[
                                "At least 8 characters",
                                "One uppercase letter",
                                "One number or symbol",
                                "Different from last 3 passwords"
                            ].map((tip, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                    <Check size={13} color="rgba(255, 255, 255, 0.30)" style={{ flexShrink: 0 }} />
                                    <Typography sx={{
                                        fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                        fontSize: '13px',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        lineHeight: 1.2,
                                    }}>
                                        {tip}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                );

            case 'login':
            default:
                return (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                        }}
                    >
                        {[
                            { value: "1,200+", label: "Patients" },
                            { value: "99.9%", label: "Uptime" },
                            { value: "ISO 27001", label: "Certified" },
                            { value: "50+", label: "Doctors" },
                            { value: "< 2 min", label: "Avg. Wait" },
                            { value: "256-bit", label: "Encryption" }
                        ].map((stat, idx) => {
                            const row = Math.floor(idx / 3);
                            const col = idx % 3;
                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        textAlign: 'center',
                                        p: 2.25,
                                        borderRight: col < 2 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                        borderBottom: row < 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                    }}
                                >
                                    <Typography sx={{
                                        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
                                        fontSize: '22px',
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        lineHeight: 1.1,
                                        mb: 0.5,
                                    }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                        fontSize: '9px',
                                        fontWeight: 500,
                                        color: '#5EEAD4',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.5px',
                                        lineHeight: 1.2,
                                    }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                );
        }
    };

    return (
        <Box
            sx={{
                display: { xs: 'none', lg: 'flex' },
                width: '42%', // Panel width: w-[42%] on desktop, hidden on mobile
                flexShrink: 0,
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { md: 5, lg: 6, xl: 8 },
                backgroundColor: '#0D3D38', // Solid deep teal
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
            }}
        >
            {/* ── High-Tech Geometric Line Patterns (Microsoft Fluent Style) ── */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="gridPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.025)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
                {/* Subtle abstract geometric vector lines */}
                <circle cx="100%" cy="0%" r="200" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />
                <circle cx="100%" cy="0%" r="320" fill="none" stroke="rgba(255, 255, 255, 0.01)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="0%" cy="100%" r="260" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />
            </svg>

            {/* Subtle top accent brand color bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#5EEAD4', zIndex: 2 }} />

            {/* ── Logo + Wordmark + Separator Line (Top) ── */}
            <Box sx={{ width: '100%', flexShrink: 0, zIndex: 1 }}>
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <AlShifaaLogo size={40} white />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Outfit', 'Segoe UI', sans-serif",
                                fontWeight: 700,
                                fontSize: '18px',
                                color: '#FFFFFF',
                                letterSpacing: '-0.3px',
                                lineHeight: 1.1,
                            }}
                        >
                            Al Shifaa
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: "'Segoe UI', 'Inter', sans-serif",
                                fontSize: '9px',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.55)',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                            }}
                        >
                            Health Management System
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pt: 2.5, width: '100%' }} />
            </Box>

            {/* ── Headline + Subtitle + Swappable slot (Middle) ── */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 4.5, // 36px gap
                    zIndex: 1,
                }}
            >
                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: "'Segoe UI', 'Outfit', sans-serif",
                            fontWeight: 600,
                            fontSize: { md: '26px', lg: '30px', xl: '34px' },
                            color: '#FFFFFF',
                            lineHeight: 1.2,
                            mb: 2,
                            letterSpacing: '-0.5px',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {config.headline}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'Segoe UI', 'Inter', sans-serif",
                            color: 'rgba(255, 255, 255, 0.55)',
                            fontSize: '13.5px',
                            lineHeight: 1.6,
                            maxWidth: '300px',
                        }}
                    >
                        {config.subtitle}
                    </Typography>
                </Box>

                {renderMidBlock()}
            </Box>

            {/* ── Compliance Badges (Bottom) ── */}
            <Box
                sx={{
                    flexShrink: 0,
                    display: 'flex',
                    gap: 1.25,
                    flexWrap: 'wrap',
                    pt: 3,
                    pb: 0.5,
                    zIndex: 1,
                }}
            >
                {[
                    "HIPAA Compliant",
                    "ISO 27001",
                    "Enterprise SSO"
                ].map((text) => (
                    <Box
                        key={text}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '10.5px',
                            fontFamily: "'Segoe UI', 'Inter', sans-serif",
                            fontWeight: 500,
                        }}
                    >
                        <Check size={11} strokeWidth={3} color="#5EEAD4" style={{ flexShrink: 0 }} />
                        <span>{text}</span>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
