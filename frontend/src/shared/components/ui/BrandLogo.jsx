import { Box, Typography } from '@mui/material';

/**
 * BrandLogo — A premium, modern clinical logo for Al Shifaa Clinical Portal.
 * Combines a clean healthcare cross, a white heartbeat pulse line, and a mint healing leaf.
 *
 * @param {number}  size        - Size of the logo icon (default: 40)
 * @param {boolean} showText    - If true, renders the brand name "Al Shifaa"
 * @param {string}  textColor   - Custom color for the brand text (default: 'text.primary')
 * @param {object}  sx          - Additional MUI sx styles on the wrapper Box
 */
export const BrandLogo = ({
    size = 40,
    showText = true,
    textColor = 'text.primary',
    sx = {},
}) => {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, ...sx }}>
            <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Rounded hospital cross backing */}
                <rect x="16" y="4" width="16" height="40" rx="6" fill="#006A6A" fillOpacity="0.12" />
                <rect x="4" y="16" width="40" height="16" rx="6" fill="#006A6A" fillOpacity="0.12" />
                
                {/* Inner solid cross */}
                <rect x="18.5" y="7" width="11" height="34" rx="4" fill="#006A6A" />
                <rect x="7" y="18.5" width="34" height="11" rx="4" fill="#006A6A" />
                
                {/* Pulse wave (ECG) drawing inside cross */}
                <path 
                    d="M 12 24 L 20 24 L 22.5 17 L 25.5 31 L 28 21 L 30 24 L 36 24" 
                    stroke="#FFFFFF" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
                
                {/* Accent healing leaf / crescent in mint green */}
                <path 
                    d="M32 14c-3.5 0-7 2.5-7.5 6 2.5-0.5 5.5 1 6.5 3.5 1-2.5 3.5-4 7-4 0-3.5-2.5-5.5-6-5.5z" 
                    fill="#4DB6AC" 
                />
            </svg>

            {showText && (
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            color: textColor,
                            letterSpacing: '-0.5px',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '20px',
                            lineHeight: 1.1,
                        }}
                    >
                        Al Shifaa
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.disabled',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '1.2px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Clinical Network
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
