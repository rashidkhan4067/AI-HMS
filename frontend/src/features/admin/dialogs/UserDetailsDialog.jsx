import { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Box, Grid, Typography, Chip, Button, Divider, Avatar, Alert } from '@mui/material';
import { formatDate } from '../../../shared/utils/dateUtils';
import { getMediaUrl, getFilename } from '../../../shared/utils/mediaUtils';
import { adminApi } from '../services/adminApi';



const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
};

export const UserDetailsDialog = ({ 
    open, 
    onClose, 
    selectedUser, 
    currentUser, 
    applications = [], 
    invites = [], 
    onOpenDelete, 
    onOpenEdit,
    onUserUpdate
}) => {
    const [unlocking, setUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState(null);

    if (!selectedUser) return null;

    const isLocked = selectedUser.locked_until && new Date(selectedUser.locked_until) > new Date();

    const handleUnlock = async () => {
        setUnlocking(true);
        setUnlockError(null);
        try {
            await adminApi.unlockUser(selectedUser.id);
            if (onUserUpdate) {
                await onUserUpdate({ locked_until: null, failed_attempts: 0 });
            }
        } catch (err) {
            setUnlockError(err.response?.data?.detail || 'Failed to unlock user.');
        } finally {
            setUnlocking(false);
        }
    };

    // Look up matching doctor application
    const doctorApp = selectedUser.role === 'DOCTOR' 
        ? applications.find(app => app.email.toLowerCase() === selectedUser.email.toLowerCase())
        : null;

    // Look up matching onboarding invitation
    const matchingInvite = invites.find(inv => inv.email.toLowerCase() === selectedUser.email.toLowerCase());

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { 
                        borderRadius: { xs: '20px', sm: '28px' }, 
                        p: { xs: 2.5, sm: 3 }, 
                        m: { xs: 1.5, sm: 2 },
                        maxWidth: 520, 
                        width: '100%',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Avatar 
                    sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.main', 
                        width: 46, 
                        height: 46, 
                        fontSize: '16px', 
                        fontWeight: 700, 
                        fontFamily: "'Outfit', sans-serif" 
                    }}
                >
                    {getInitials(selectedUser.full_name)}
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedUser.full_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Account & Security Profile
                    </Typography>
                </Box>
            </Box>
            
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0, overflowY: 'auto', maxHeight: '60vh' }}>
                {isLocked && (
                    <Alert severity="warning" sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                        This user account is currently locked out until {new Date(selectedUser.locked_until).toLocaleString()} due to failed login attempts.
                    </Alert>
                )}
                {unlockError && (
                    <Alert severity="error" sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                        {unlockError}
                    </Alert>
                )}
                {/* Account ID / UUID */}
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>
                        Account UUID Reference
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1.75, py: 1, borderRadius: '12px', border: '1px solid', borderColor: 'divider', fontSize: '12px', wordBreak: 'break-all', color: 'text.secondary' }}>
                        {selectedUser.id}
                    </Typography>
                </Box>

                {/* Basic Details Grid */}
                <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Email Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all', mt: 0.5 }}>{selectedUser.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Phone Number</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedUser.phone || '-'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Assigned Role</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip label={selectedUser.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '10px', fontWeight: 600, height: 22 }} />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Active Status</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip 
                                    label={selectedUser.is_active ? 'Active' : 'Inactive'} 
                                    size="small" 
                                    color={selectedUser.is_active ? 'success' : 'default'} 
                                    sx={{ fontWeight: 600, fontSize: '10px', borderRadius: '6px', height: 22 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Department</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedUser.department_name || 'General Clinic'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Registered Date</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: 'text.secondary' }}>{formatDate(selectedUser.created_at)}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Onboarding Credentials */}
                {doctorApp && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                            Verified Clinical Credentials
                        </Typography>
                        <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
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
                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', fontFamily: "'DM Sans', sans-serif" }}>
                                                PMDC Certificate: {getFilename(doctorApp.pmdc_certificate)}
                                            </Typography>
                                            <Button size="small" component="a" href={getMediaUrl(doctorApp.pmdc_certificate)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', fontFamily: "'DM Sans', sans-serif" }}>
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

                {/* Onboarding logs */}
                {matchingInvite && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                            Onboarding Invitation History
                        </Typography>
                        <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Invitation Issued At</Typography>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, mt: 0.5 }}>{formatDate(matchingInvite.created_at)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Onboarding Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip label="VERIFIED & JOINED" size="small" color="success" sx={{ fontSize: '9px', fontWeight: 700, height: 20 }} />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions 
                sx={{ 
                    p: 0, 
                    pt: 3, 
                    gap: 1.5, 
                    flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                    justifyContent: 'space-between',
                    width: '100%',
                    '& button': {
                        width: { xs: '100%', sm: 'auto' }
                    }
                }}
            >
                <Box 
                    sx={{ 
                        display: 'flex', 
                        gap: 1.5, 
                        flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                        width: { xs: '100%', sm: 'auto' },
                        '& button': {
                            width: { xs: '100%', sm: 'auto' }
                        }
                    }}
                >
                    <Button 
                        onClick={() => onOpenDelete(selectedUser)} 
                        variant="outlined" 
                        color="error" 
                        disabled={currentUser && currentUser.id === selectedUser.id}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, py: 1.1, fontSize: '14px' }}
                    >
                        Delete Account
                    </Button>
                    <Button 
                        onClick={handleUnlock}
                        variant="outlined" 
                        color="warning" 
                        disabled={!isLocked || unlocking}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, py: 1.1, fontSize: '14px' }}
                    >
                        {unlocking ? 'Unlocking...' : 'Unlock Account'}
                    </Button>
                    <Button 
                        onClick={() => onOpenEdit(selectedUser)} 
                        variant="contained" 
                        color="primary"
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', px: 3, py: 1.1, fontSize: '14px' }}
                    >
                        Edit Profile
                    </Button>
                </Box>
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
                    Dismiss
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsDialog;
