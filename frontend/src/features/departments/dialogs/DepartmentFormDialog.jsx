import React from 'react';
import { Dialog, DialogContent, DialogActions, Box, TextField, Button, Typography, Avatar, Grid, Switch } from '@mui/material';
import { Building2 } from 'lucide-react';

export const DepartmentFormDialog = ({ 
    open, 
    onClose, 
    mode = 'create',
    department,
    formName,
    formCode,
    formDescription,
    formLocation,
    formContactNumber,
    formIsActive = true,
    onFormChange,
    formErrors = {}, 
    formSubmitting, 
    onSubmit
}) => {
    const isEdit = mode === 'edit';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: { 
                        borderRadius: { xs: '20px', sm: '28px' }, 
                        p: { xs: 2.5, sm: 3 },
                        m: { xs: 1.5, sm: 2 },
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                    sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.main',
                        width: 44,
                        height: 44
                    }}
                >
                    <Building2 size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isEdit ? 'Edit Department' : 'Create Department'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        {isEdit 
                            ? `Modify registry values for ${department?.name}`
                            : 'Register a new clinical department to the hospital directory'
                        }
                    </Typography>
                </Box>
            </Box>

            <Box component="form" onSubmit={onSubmit}>
                <DialogContent sx={{ p: 0.5, pt: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    
                    {/* Name & Code Grid */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: !!formErrors.name ? 'error.main' : 'text.secondary',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}
                                >
                                    Department Name <span style={{ color: '#F87171' }}>*</span>
                                </Typography>
                                <TextField
                                    placeholder="e.g. Cardiology, Neurology"
                                    fullWidth
                                    value={formName}
                                    onChange={(e) => onFormChange('name', e.target.value)}
                                    error={!!formErrors.name}
                                    helperText={formErrors.name}
                                    required
                                    autoFocus
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: !!formErrors.code ? 'error.main' : 'text.secondary',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}
                                >
                                    Code <span style={{ color: '#F87171' }}>*</span>
                                </Typography>
                                <TextField
                                    placeholder="e.g. CARD"
                                    fullWidth
                                    value={formCode}
                                    onChange={(e) => onFormChange('code', e.target.value)}
                                    error={!!formErrors.code}
                                    helperText={formErrors.code}
                                    required
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Location & Contact Grid */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={7}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}
                                >
                                    Location / Block
                                </Typography>
                                <TextField
                                    placeholder="e.g. Block B, 3rd Floor"
                                    fullWidth
                                    value={formLocation}
                                    onChange={(e) => onFormChange('location', e.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}
                                >
                                    Contact Extension
                                </Typography>
                                <TextField
                                    placeholder="e.g. x4123"
                                    fullWidth
                                    value={formContactNumber}
                                    onChange={(e) => onFormChange('contact_number', e.target.value)}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Description */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Description
                        </Typography>
                        <TextField
                            placeholder="Brief description of the department's clinical focus and specialization..."
                            fullWidth
                            multiline
                            rows={3}
                            value={formDescription}
                            onChange={(e) => onFormChange('description', e.target.value)}
                        />
                    </Box>

                    {/* Active Status Switch */}
                    {isEdit && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            p: 1.5, 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: '12px', 
                            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                            mt: 0.5
                        }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                                    Active Status
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2, mt: 0.25 }}>
                                    If inactive, this department is hidden from new staff onboarding and signup selections.
                                </Typography>
                            </Box>
                            <Switch
                                checked={formIsActive}
                                onChange={(e) => onFormChange('is_active', e.target.checked)}
                                color="primary"
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions 
                    sx={{ 
                        p: 0, 
                        pt: 3, 
                        gap: 1.5, 
                        flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                        justifyContent: 'flex-end',
                        '& button': {
                            width: { xs: '100%', sm: 'auto' }
                        }
                    }}
                >
                    <Button 
                        onClick={onClose} 
                        variant="outlined" 
                        sx={{ 
                            borderRadius: '100px', 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            borderColor: 'divider', 
                            color: 'text.primary',
                            px: 3.5,
                            py: 1.1,
                            fontSize: '14px',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'text.secondary'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained" 
                        disabled={formSubmitting || !formName?.trim() || !formCode?.trim()}
                        sx={{ 
                            borderRadius: '100px', 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            boxShadow: 'none',
                            px: 3.5,
                            py: 1.1,
                            fontSize: '14px',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {formSubmitting 
                            ? (isEdit ? 'Saving...' : 'Creating...') 
                            : (isEdit ? 'Save Changes' : 'Create Department')
                        }
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default DepartmentFormDialog;
