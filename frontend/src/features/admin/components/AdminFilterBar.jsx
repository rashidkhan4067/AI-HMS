import React from 'react';
import { Grid, TextField, InputAdornment, MenuItem } from '@mui/material';
import { Search } from 'lucide-react';

export const AdminFilterBar = ({
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
    return (
        <Grid container spacing={2}>
            {/* Search Input */}
            <Grid item xs={12} sm={6}>
                <TextField
                    placeholder={searchPlaceholder}
                    fullWidth
                    size="small"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '100px' }
                        }
                    }}
                />
            </Grid>

            {/* Filter Dropdown 1 */}
            {filter1Label && (
                <Grid item xs={6} sm={3}>
                    <TextField
                        select
                        label={filter1Label}
                        fullWidth
                        size="small"
                        value={filter1Value}
                        onChange={(e) => onFilter1Change(e.target.value)}
                        slotProps={{
                            select: {
                                sx: { borderRadius: '100px' }
                            }
                        }}
                    >
                        {filter1Options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            )}

            {/* Filter Dropdown 2 */}
            {filter2Label && (
                <Grid item xs={6} sm={3}>
                    <TextField
                        select
                        label={filter2Label}
                        fullWidth
                        size="small"
                        value={filter2Value}
                        onChange={(e) => onFilter2Change(e.target.value)}
                        slotProps={{
                            select: {
                                sx: { borderRadius: '100px' }
                            }
                        }}
                    >
                        {filter2Options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            )}
        </Grid>
    );
};

export default AdminFilterBar;
