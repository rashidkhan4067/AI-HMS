import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, MenuItem, Button, Typography, Avatar } from '@mui/material';
import { User } from 'lucide-react';

export const EditUserDialog = ({ 
    open, 
    onClose, 
    selectedUser, 
    editForm, 
    onFormChange, 
    editErrors = {}, 
    editSubmitting, 
    onSubmit,
    departments = [],
    loadingDepartments
}) => {
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                    sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.main',
                        width: 44,
                        height: 44
                    }}
                >
                    <User size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Edit Profile
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Modify registry values for {selectedUser?.full_name}
                    </Typography>
                </Box>
            </Box>

            <Box component="form" onSubmit={onSubmit}>
                <DialogContent sx={{ p: 0.5, pt: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: !!editErrors.full_name ? 'error.main' : 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Full Name <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            placeholder="Enter full name"
                            fullWidth
                            value={editForm.full_name}
                            onChange={(e) => onFormChange('full_name', e.target.value)}
                            error={!!editErrors.full_name}
                            helperText={editErrors.full_name}
                            required
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: !!editErrors.role ? 'error.main' : 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Assigned Role <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={editForm.role}
                            onChange={(e) => onFormChange('role', e.target.value)}
                            error={!!editErrors.role}
                            helperText={editErrors.role}
                            required
                        >
                            <MenuItem value="ADMIN">Administrator</MenuItem>
                            <MenuItem value="DOCTOR">Doctor</MenuItem>
                            <MenuItem value="NURSE">Nurse</MenuItem>
                            <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                            <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
                            <MenuItem value="LAB_TECHNICIAN">Lab Tech</MenuItem>
                            <MenuItem value="RADIOLOGIST">Radiologist</MenuItem>
                            <MenuItem value="PATIENT">Patient</MenuItem>
                        </TextField>
                    </Box>

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
                            Department
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={editForm.department || ''}
                            onChange={(e) => onFormChange('department', e.target.value)}
                            disabled={loadingDepartments}
                        >
                            <MenuItem value="">General Clinic / None</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: !!editErrors.employee_id ? 'error.main' : 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Employee ID <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            placeholder="e.g. EMP-1024"
                            fullWidth
                            value={editForm.employee_id}
                            onChange={(e) => onFormChange('employee_id', e.target.value)}
                            error={!!editErrors.employee_id}
                            helperText={editErrors.employee_id}
                            required
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: !!editErrors.phone ? 'error.main' : 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Phone Number <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            placeholder="e.g. +92 300 1234567"
                            fullWidth
                            value={editForm.phone}
                            onChange={(e) => onFormChange('phone', e.target.value)}
                            error={!!editErrors.phone}
                            helperText={editErrors.phone}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions 
                    sx={{ 
                        p: 0, 
                        pt: 3, 
                        gap: 1.5, 
                        flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                        justifyContent: 'flex-end',
                        width: '100%',
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
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={editSubmitting}
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
                        {editSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EditUserDialog;
