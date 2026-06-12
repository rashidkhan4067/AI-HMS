import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Grid, Typography, Chip, Button, Divider, Avatar } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { api as axiosInstance } from '../../../lib/api';

const getMediaUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = axiosInstance.defaults.baseURL || 'http://localhost:8000/api/';
    const domain = base.replace(/\/api\/?.*$/, '');
    return `${domain}${path}`;
};

const getFilename = (url) => {
    if (!url) return 'document.pdf';
    return url.split('/').pop();
};

export const ToggleAccessDialog = ({ open, onClose, user, applications = [], onConfirm }) => {
    if (!user) return null;

    const doctorApp = user.role === 'DOCTOR' 
        ? applications.find(app => app.email.toLowerCase() === user.email.toLowerCase())
        : null;

    const isSuspending = user.is_active;

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
                        bgcolor: isSuspending ? 'rgba(219, 68, 85, 0.08)' : 'rgba(76, 175, 80, 0.08)', 
                        color: isSuspending ? '#DB4437' : '#4CAF50',
                        width: 44,
                        height: 44
                    }}
                >
                    <AlertTriangle size={24} />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2 }}>
                        {isSuspending ? 'Suspend User Access?' : 'Approve User Access?'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Security Permission Controls
                    </Typography>
                </Box>
            </Box>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <DialogContentText sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', lineHeight: 1.6 }}>
                    {isSuspending 
                        ? `Are you sure you want to suspend system access for ${user.full_name}? The user will be blocked immediately from authenticating.` 
                        : `Review details and onboarded credentials before authorizing system access for ${user.full_name}.`
                    }
                </DialogContentText>

                {/* User Details Card */}
                <Box sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Email Address</Typography>
                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5, wordBreak: 'break-all' }}>{user.email}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Role</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip label={user.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 700, height: 20 }} />
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Employee ID</Typography>
                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{user.employee_id || '-'}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Clinical Verification details for DOCTOR */}
                {doctorApp && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '10.5px' }}>
                            Audited Doctor Credentials
                        </Typography>
                        <Box sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>PMDC Registration #</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.pmdc_number}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Specialization</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.specialization}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Experience</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.experience_years} Years</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Affiliation</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.current_hospital || 'Private Practice'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 700, mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Onboarding Attachments</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%', fontFamily: "'DM Sans', sans-serif" }}>
                                                PMDC Certificate: {getFilename(doctorApp.pmdc_certificate)}
                                            </Typography>
                                            <Button size="small" component="a" href={getMediaUrl(doctorApp.pmdc_certificate)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%', fontFamily: "'DM Sans', sans-serif" }}>
                                                CNIC ID Document: {getFilename(doctorApp.cnic_document)}
                                            </Typography>
                                            <Button size="small" component="a" href={getMediaUrl(doctorApp.cnic_document)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}
                
                {!isSuspending && (
                    <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.04)', border: '1px solid rgba(76, 175, 80, 0.12)', borderRadius: '16px' }}>
                        <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600, display: 'block', lineHeight: 1.45 }}>
                            ✅ Note: Enabling access activates the user credentials instantly, granting secure logins for their designated role.
                        </Typography>
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
                    onClick={onConfirm} 
                    variant="contained" 
                    color={isSuspending ? 'error' : 'primary'}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        boxShadow: 'none', 
                        px: 3.5,
                        py: 1.1,
                        fontSize: '14px',
                        bgcolor: isSuspending ? '#DB4437' : 'primary.main',
                        '&:hover': {
                            bgcolor: isSuspending ? '#c53929' : 'primary.dark',
                            boxShadow: 'none'
                        }
                    }}
                >
                    {isSuspending ? 'Suspend Access' : 'Authorize Access'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ToggleAccessDialog;
