import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

export const TestimonialsSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            quote: "Al Shifaa completely transformed how we manage patient records. What used to take 20 minutes now takes 2.",
            name: "Dr. Ahmed Raza",
            role: "Cardiologist",
            initials: "AR"
        },
        {
            quote: "The role-based access system means every staff member sees exactly what they need and nothing they shouldn't.",
            name: "Sara Malik",
            role: "Hospital Admin",
            initials: "SM"
        },
        {
            quote: "The AI insights feature flagged a patient pattern I would have missed. This system genuinely improves clinical outcomes.",
            name: "Dr. Fatima Khan",
            role: "General Practitioner",
            initials: "FK"
        }
    ];

    return (
        <Box
            id="testimonials"
            sx={{
                scrollMarginTop: '80px',
                py: { xs: 6, sm: 8, md: 12 },
                px: { xs: 2.5, sm: 4, md: 6 },
                backgroundColor: isDark ? '#1F2929' : '#F9FAFB',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)'}`,
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 1280 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: { xs: '24px', sm: '34px', md: '40px' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            mb: 1.5,
                            color: isDark ? '#E0F2F1' : '#161D1D',
                            letterSpacing: '-0.8px',
                        }}
                    >
                        Trusted by Professionals
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: { xs: '14px', md: '15.5px' },
                            color: isDark ? '#B2C7C7' : '#6B7280',
                            maxWidth: 600,
                            lineHeight: 1.5,
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                            What clinical leaders say about Al Shifaa.
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                            What doctors and hospital administrators say about Al Shifaa HMS.
                        </Box>
                    </Typography>
                </Box>

                {/* Grid (Desktop only) */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'grid' },
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 4,
                    }}
                >
                    {testimonials.map((test, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                backgroundColor: isDark ? '#161D1D' : '#FFFFFF',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)',
                                p: 3.5,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isDark 
                                    ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
                                    : '0 10px 30px rgba(0, 106, 106, 0.02)',
                                height: '100%',
                            }}
                        >
                            <Box>
                                {/* Stars */}
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 2.5 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={15} fill="#F59E0B" stroke="#F59E0B" />
                                    ))}
                                </Box>

                                {/* Quote */}
                                <Typography
                                    sx={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: '14.5px',
                                        fontStyle: 'italic',
                                        lineHeight: 1.6,
                                        color: isDark ? '#E0F2F1' : '#374151',
                                        mb: 3.5,
                                    }}
                                >
                                    "{test.quote}"
                                </Typography>
                            </Box>

                            {/* Author */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '50%',
                                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'rgba(0, 106, 106, 0.06)',
                                        color: isDark ? '#4DB6AC' : '#006A6A',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        fontFamily: "'Outfit', sans-serif",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: `1px solid ${isDark ? 'rgba(77, 182, 172, 0.2)' : 'rgba(0, 106, 106, 0.15)'}`
                                    }}
                                >
                                    {test.initials}
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '13.5px',
                                            color: isDark ? '#E0F2F1' : '#111827',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {test.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: '11.5px',
                                            color: isDark ? '#8A9F9F' : '#6B7280',
                                            mt: 0.2,
                                        }}
                                    >
                                        {test.role}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Swiper / Carousel Pager (Mobile/Tablet only) */}
                <Box 
                    sx={{ 
                        display: { xs: 'flex', md: 'none' }, 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 2.5 
                    }}
                >
                    <AnimatePresence mode="wait">
                        <Box
                            component={motion.div}
                            key={activeIndex}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            sx={{
                                width: '100%',
                                backgroundColor: isDark ? '#161D1D' : '#FFFFFF',
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)',
                                p: { xs: 2.5, sm: 3 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isDark 
                                    ? '0 10px 25px -10px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 20px rgba(0, 106, 106, 0.01)',
                            }}
                        >
                            <Box>
                                {/* Stars */}
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                                    ))}
                                </Box>

                                {/* Quote */}
                                <Typography
                                    sx={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: '13.5px',
                                        fontStyle: 'italic',
                                        lineHeight: 1.55,
                                        color: isDark ? '#E0F2F1' : '#374151',
                                        mb: 3,
                                    }}
                                >
                                    "{testimonials[activeIndex].quote}"
                                </Typography>
                            </Box>

                            {/* Author */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'rgba(0, 106, 106, 0.06)',
                                        color: isDark ? '#4DB6AC' : '#006A6A',
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        fontFamily: "'Outfit', sans-serif",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: `1px solid ${isDark ? 'rgba(77, 182, 172, 0.2)' : 'rgba(0, 106, 106, 0.15)'}`
                                    }}
                                >
                                    {testimonials[activeIndex].initials}
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            color: isDark ? '#E0F2F1' : '#111827',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {testimonials[activeIndex].name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: '11px',
                                            color: isDark ? '#8A9F9F' : '#6B7280',
                                            mt: 0.15,
                                        }}
                                    >
                                        {testimonials[activeIndex].role}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </AnimatePresence>

                    {/* Pagination Dots indicator */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {testimonials.map((_, i) => {
                            const isActive = activeIndex === i;
                            return (
                                <Box
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    component={motion.div}
                                    animate={{ width: isActive ? 16 : 6 }}
                                    transition={{ duration: 0.2 }}
                                    sx={{
                                        height: 6,
                                        borderRadius: '3px',
                                        backgroundColor: isActive 
                                            ? (isDark ? '#4DB6AC' : '#006A6A') 
                                            : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,106,106,0.15)'),
                                        cursor: 'pointer'
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
