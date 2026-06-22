import React from 'react';
import { Box, TextField, InputAdornment, MenuItem, useTheme } from '@mui/material';
import { Search } from 'lucide-react';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const FilterBar = ({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filter1Label,
    filter1Value,
    onFilter1Change,
    filter1Options = [],
    filter2Label,
    filter2Value,
    onFilter2Change,
    filter2Options = []
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Google-style pill design tokens
    const inputStyle = {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F1F3F4',
        borderRadius: '24px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E8EAED',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#DADCE0',
        },
        '&.Mui-focused': {
            bgcolor: isDark ? 'background.paper' : '#FFFFFF',
            borderColor: COLORS.PRIMARY,
            boxShadow: isDark ? '0 1px 2px 0 rgba(0,0,0,0.3)' : '0 1px 2px 0 rgba(60,64,67,0.15)',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
        },
        '& .MuiInputBase-input': {
            py: 1,
            px: 1.5,
        }
    };

    const getRenderValue = (value, label, options) => {
        if (value === undefined || value === null || value === '') {
            return label;
        }
        const found = options.find(o => String(o.value) === String(value));
        return `${label}: ${found ? found.label : value}`;
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            width: '100%',
            alignItems: 'center',
            mb: 1.5
        }}>
            {/* Search Input */}
            <Box sx={{ flex: 1, width: '100%' }}>
                <TextField
                    placeholder={searchPlaceholder}
                    fullWidth
                    size="small"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                    <Search size={15} />
                                </InputAdornment>
                            ),
                            sx: inputStyle
                        }
                    }}
                />
            </Box>

            {/* Filter Dropdowns container */}
            <Box sx={{ 
                display: 'flex', 
                gap: 1.25, 
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'flex-start',
                flexShrink: 0
            }}>
                {/* Filter Dropdown 1 */}
                {filter1Label && (
                    <TextField
                        select
                        size="small"
                        value={filter1Value}
                        onChange={(e) => onFilter1Change(e.target.value)}
                        slotProps={{
                            select: {
                                displayEmpty: true,
                                renderValue: (val) => getRenderValue(val, filter1Label, filter1Options),
                                sx: {
                                    ...inputStyle,
                                    minWidth: 140,
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        px: 2.25,
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontFamily: FONTS.BODY,
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                    }
                                }
                            }
                        }}
                    >
                        {filter1Options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: FONTS.BODY, fontSize: '13px' }}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                {/* Filter Dropdown 2 */}
                {filter2Label && (
                    <TextField
                        select
                        size="small"
                        value={filter2Value}
                        onChange={(e) => onFilter2Change(e.target.value)}
                        slotProps={{
                            select: {
                                displayEmpty: true,
                                renderValue: (val) => getRenderValue(val, filter2Label, filter2Options),
                                sx: {
                                    ...inputStyle,
                                    minWidth: 140,
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        px: 2.25,
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontFamily: FONTS.BODY,
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                    }
                                }
                            }
                        }}
                    >
                        {filter2Options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: FONTS.BODY, fontSize: '13px' }}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            </Box>
        </Box>
    );
};

export default FilterBar;
