import React from 'react';
import { 
    Dialog, DialogContent, DialogActions, 
    Box, Grid, Typography, Chip, Divider, Button, Avatar 
} from '@mui/material';
import { Info, FileText, CheckCircle2 } from 'lucide-react';
import { StatusChip } from '../../../shared/components/ui';
import { formatDate } from '../../../shared/utils/dateUtils';
import { getMediaUrl, getFilename } from '../../../shared/utils/mediaUtils';



export const InviteDetailsDialog = ({ open, onClose, selectedInvite, users = [], applications = [] }) => {
    if (!selectedInvite) return null;

    const registeredUser = users?.find(u => u.email.toLowerCase() === selectedInvite.email.toLowerCase());
    const doctorApp = selectedInvite.role === 'DOCTOR'
        ? applications?.find(app => app.email.toLowerCase() === selectedInvite.email.toLowerCase())
        : null;

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
                        maxWidth: 540, 
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
                        width: 44,
                        height: 44
                    }}
                >
                    <Info size={22} />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2 }}>
                        Invitation Details
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Token Authorization Records
                    </Typography>
                </Box>
            </Box>
            
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0, overflowY: 'auto', maxHeight: '60vh' }}>
                
                {/* Core Onboarding Token Information */}
                <Box 
                    sx={{ 
                        p: 2.5, 
                        bgcolor: 'action.hover', 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: '20px' 
                    }}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>Email Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary', wordBreak: 'break-all', mt: 0.5 }}>
                                {selectedInvite.email}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>Role Assigned</Typography>
                            <Chip label={selectedInvite.role} size="small" color="primary" variant="outlined" sx={{ fontSize: '11px', fontWeight: 600, height: 24, mt: 0.75 }} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>Department</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.75 }}>{selectedInvite.department_name || 'General Clinic'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>Issued At</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.75, color: 'text.secondary' }}>{formatDate(selectedInvite.created_at)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>Token Status</Typography>
                            <Box sx={{ mt: 0.75 }}><StatusChip invite={selectedInvite} type="invitation" sx={{ fontSize: '11px', borderRadius: '8px', px: 0.5 }} /></Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Associated Registered User Profile if Registered */}
                <Box>
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                        User Account Registry Status
                    </Typography>
                    {registeredUser ? (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(46, 125, 50, 0.03)', border: '1px solid rgba(46, 125, 50, 0.12)', borderRadius: '20px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CheckCircle2 size={16} color="#2E7D32" />
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32' }}>Account Profile Active</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Full Name</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{registeredUser.full_name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Employee ID</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{registeredUser.employee_id || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip label={registeredUser.is_active ? 'ACTIVE ACCESS' : 'INACTIVE'} size="small" color={registeredUser.is_active ? 'success' : 'default'} sx={{ fontSize: '9px', fontWeight: 700, height: 20 }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Joined: {formatDate(registeredUser.created_at)}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                                {selectedInvite.is_expired ? "Invitation expired without registration." : "No registered user account found for this invitation email yet."}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Doctor Credentials if applicable */}
                {doctorApp && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                            Verified Clinical Credentials
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
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Clinical Experience</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.experience_years} Years</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Hospital Affiliation</Typography>
                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.current_hospital || 'Private Practice'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Onboarding Attachments</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexGrow: 1 }}>
                                                <FileText size={18} color="var(--mui-palette-primary-main)" />
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
                                                    PMDC: {getFilename(doctorApp.pmdc_certificate)}
                                                </Typography>
                                            </Box>
                                            <Button size="small" component="a" href={getMediaUrl(doctorApp.pmdc_certificate)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexGrow: 1 }}>
                                                <FileText size={18} color="var(--mui-palette-primary-main)" />
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
                                                    CNIC: {getFilename(doctorApp.cnic_document)}
                                                </Typography>
                                            </Box>
                                            <Button size="small" component="a" href={getMediaUrl(doctorApp.cnic_document)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                        </Box>
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
                        px: 4,
                        py: 1.1,
                        fontSize: '14px',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'text.secondary'
                        }
                    }}
                >
                    Close Record
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteDetailsDialog;
