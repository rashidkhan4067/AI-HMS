import React from 'react';
import { motion } from 'framer-motion';

/**
 * A reusable component to animate elements into view as the user scrolls.
 * Supports up/down/left/right sliding, fading, scaling, staggered child rendering,
 * and entry/exit scroll animations (replay when scrolling up and down).
 */
export const ScrollReveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = 40,
    once = false,
    stagger = false,
    staggerChild = false,
    scale = false,
    amount = 0.15,
    margin = '-50px',
    // Destructure MUI specific props to prevent forwarding to DOM elements
    item,
    container,
    ownerState,
    ...props
}) => {
    const directions = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {},
    };

    const initialOffset = directions[direction] || {};

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.12,
                delayChildren: delay,
            },
        },
    };

    const revealVariants = {
        hidden: {
            opacity: 0,
            ...(scale ? { scale: 0.95 } : {}),
            ...initialOffset,
        },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: {
                duration,
                ease: [0.25, 0.1, 0.25, 1], // Premium cubic-bezier easing
                delay: staggerChild ? 0 : delay,
            },
        },
    };

    if (stagger) {
        return (
            <motion.div
                initial="hidden"
                whileInView="visible"
                exit="hidden"
                viewport={{ once, amount, margin }}
                variants={containerVariants}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    if (staggerChild) {
        return (
            <motion.div variants={revealVariants} {...props}>
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            exit="hidden"
            viewport={{ once, amount, margin }}
            variants={revealVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
};
