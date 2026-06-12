import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { animate } from 'framer-motion';
import { ScrollReveal } from '../../shared/components/ui';

const StatCounter = ({ value, inView }) => {
    const [displayVal, setDisplayVal] = useState('0');

    useEffect(() => {
        if (!inView) {
            // Reset count if it goes out of view, so it animates again next time
            setDisplayVal('0');
            return;
        }

        const match = value.match(/^([\d,.]+)(.*)$/);
        if (!match) {
            setDisplayVal(value);
            return;
        }

        const numStr = match[1];
        const suffix = match[2];
        const hasComma = numStr.includes(',');
        const cleanNumStr = numStr.replace(/,/g, '');
        const numericValue = parseFloat(cleanNumStr);
        const isDecimal = numStr.includes('.');
        const decimalPlaces = isDecimal ? numStr.split('.')[1].length : 0;

        const controls = animate(0, numericValue, {
            duration: 2,
            ease: 'easeOut',
            onUpdate(val) {
                let formatted = '';
                if (isDecimal) {
                    formatted = val.toFixed(decimalPlaces);
                } else {
                    formatted = Math.floor(val).toString();
                }
                if (hasComma) {
                    formatted = parseFloat(formatted).toLocaleString('en-US');
                }
                setDisplayVal(formatted + suffix);
            }
        });

        return () => controls.stop();
    }, [inView, value]);

    return <span>{displayVal}</span>;
};

export const StatsBar = () => {
    const { ref, inView } = useInView({
        triggerOnce: false, // Set to false to support scrolling up and down
        threshold: 0.2,
    });

    const stats = [
        { value: '50+', label: 'Hospitals Onboarded' },
        { value: '1,200+', label: 'Patients Managed' },
        { value: '99.9%', label: 'System Uptime' },
        { value: '15min', label: 'Avg Response Time' },
        { value: '256-bit', label: 'Encryption Standard' },
    ];

    return (
        <Box
            ref={ref}
            sx={{
                width: '100%',
                background: 'linear-gradient(135deg, #005858 0%, #006A6A 40%, #007A7A 100%)',
                py: { xs: 3, sm: 5, md: 6 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                component={ScrollReveal}
                stagger
                sx={{
                    maxWidth: 1280,
                    mx: 'auto',
                    px: { xs: 1.5, sm: 4, lg: 6 },
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    gap: { xs: 0, sm: 1.5, md: 2 },
                }}
            >
                {stats.map((stat, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && (
                            <Box
                                sx={{
                                    width: '1px',
                                    height: { xs: 28, sm: 36, md: 44 },
                                    background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent)',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box 
                            component={ScrollReveal}
                            staggerChild
                            direction="up"
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: { xs: '18px', sm: '28px', md: '44px' },
                                    fontWeight: 700,
                                    color: '#FFFFFF',
                                    letterSpacing: '-0.02em',
                                    mb: { xs: 0.25, md: 0.5 },
                                    lineHeight: 1.1,
                                }}
                            >
                                <StatCounter value={stat.value} inView={inView} />
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: { xs: '7px', sm: '10px', md: '13px' },
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 500,
                                    letterSpacing: { xs: '0.04em', md: '0.08em' },
                                    textTransform: 'uppercase',
                                    lineHeight: 1.3,
                                }}
                            >
                                {stat.label}
                            </Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

