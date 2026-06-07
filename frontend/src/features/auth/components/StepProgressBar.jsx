import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * StepProgressBar — Redesigned MD3 linear stepper with distinct completed, active, and upcoming states.
 *
 * Props:
 *   currentStep  number   (1-indexed)
 *   totalSteps   number
 *   labels       string[]
 */
const StepProgressBar = ({ steps = [], currentStep = 1, completedSteps = [] }) => {
    const totalSteps = steps.length;
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                mb: 4,
                pb: 4, // Room for absolute-positioned labels
                px: 3, // Inset step nodes so labels do not clip at the edges
            }}
        >
            {Array.from({ length: totalSteps }).map((_, idx) => {
                const stepNum = idx + 1;
                const isComplete = completedSteps.includes(stepNum) || stepNum < currentStep;
                const isCurrent  = stepNum === currentStep;

                // Segment leading to this step (for idx > 0)
                const isSegmentComplete = completedSteps.includes(stepNum - 1) || currentStep > stepNum;
                const isSegmentActive   = currentStep === stepNum;

                return (
                    <React.Fragment key={idx}>
                        {/* Connector Line (runs between steps) */}
                        {idx > 0 && (
                            <Box
                                sx={{
                                    flex: 1,
                                    mx: 1.5,
                                    height: 2, // h-0.5 (2px)
                                    bgcolor: '#E5E7EB', // bg-gray-200 for upcoming segment
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <Box
                                    component={motion.div}
                                    initial={{ width: '0%' }}
                                    animate={{
                                        width: (isSegmentComplete || isSegmentActive) ? '100%' : '0%'
                                    }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        background: isSegmentActive
                                            ? 'linear-gradient(90deg, #006A6A 0%, #E5E7EB 100%)'
                                            : '#006A6A',
                                    }}
                                />
                            </Box>
                        )}

                        {/* Step Node (Circle + Label below) */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                            }}
                        >
                            {/* Circle wrapper with breathing pulse ring */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: 36, // w-9 (36px)
                                    height: 36, // h-9 (36px)
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {isCurrent && (
                                    <Box
                                        component={motion.div}
                                        animate={{
                                            scale: [1, 1.15, 1],
                                            opacity: [0.8, 0.4, 0.8]
                                        }}
                                        transition={{
                                            duration: 1.8,
                                            repeat: Infinity,
                                            ease: 'easeInOut'
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: -4,
                                            left: -4,
                                            right: -4,
                                            bottom: -4,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0, 106, 106, 0.2)', // ring-4 ring-[#006A6A]/20
                                            zIndex: 0,
                                        }}
                                    />
                                )}

                                <Box
                                    sx={{
                                        width: 36, // w-9 (36px)
                                        height: 36, // h-9 (36px)
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1,
                                        backgroundColor: isComplete
                                            ? '#006A6A'
                                            : isCurrent
                                                ? '#006A6A'
                                                : '#FFFFFF', // bg-white for upcoming
                                        border: isComplete
                                            ? '2px solid #006A6A'
                                            : isCurrent
                                                ? '2px solid #006A6A'
                                                : '2px solid #D1D5DB', // border-2 border-gray-300 for upcoming
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {isComplete ? (
                                        <Check size={18} color="#FFFFFF" strokeWidth={3} />
                                    ) : (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: isCurrent ? 700 : 500, // font-medium for upcoming
                                                fontSize: '13px',
                                                fontFamily: "'DM Sans', sans-serif",
                                                color: isCurrent ? '#FFFFFF' : '#6B7280', // text-gray-500 for upcoming
                                            }}
                                        >
                                            {stepNum}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Label below circle */}
                            {steps[idx] && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        top: 42,
                                        left: idx === 0 ? 0 : idx === totalSteps - 1 ? 'auto' : '50%',
                                        right: idx === totalSteps - 1 ? 0 : 'auto',
                                        transform: idx === 0 ? 'none' : idx === totalSteps - 1 ? 'none' : 'translateX(-50%)',
                                        textAlign: idx === 0 ? 'left' : idx === totalSteps - 1 ? 'right' : 'center',
                                        fontSize: '12px', // text-xs
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontWeight: isCurrent ? 600 : 500, // font-semibold for active
                                        color: isComplete
                                            ? '#006A6A'
                                            : isCurrent
                                                ? '#006A6A' // text-[#006A6A]
                                                : '#6B7280', // text-gray-500 for upcoming
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {steps[idx]}
                                </Typography>
                            )}
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

export default StepProgressBar;
