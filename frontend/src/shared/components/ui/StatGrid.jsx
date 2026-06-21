import React from 'react';
import { Box } from '@mui/material';

export const StatGrid = ({ children, cols = 4 }) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: `repeat(${cols}, 1fr)`
                },
                gap: '12px',
                width: '100%',
                alignItems: 'stretch'
            }}
        >
            {React.Children.map(children, (child) => {
                if (!child) return null;
                return React.cloneElement(child, {
                    sx: {
                        ...child.props.sx,
                        width: '100%',
                        height: '100%'
                    }
                });
            })}
        </Box>
    );
};

export default StatGrid;
