import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Box, Grid, Typography, Chip, Card, Button, Avatar, Divider 
} from '@mui/material';
import { FileText, X, Check, Eye } from 'lucide-react';
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

export const ApplicationDetailsDialog = ({ 
    open, 
    onClose, 
    selectedApp, 
    users = [], 
    actionLoading, 
    openApproveConfirm, 
    openRejectConfirm 
}) => {
    if (!selectedApp) return null;

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
                    <Eye size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Dr. {selectedApp.full_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Clinical Onboarding Profile
                    </Typography>
                </Box>
            </Box>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0, overflowY: 'auto', maxHeight: '60vh' }}>
                
                {selectedApp.status === 'REJECTED' && (
                    <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(219, 68, 85, 0.05)', border: '1px solid rgba(219, 68, 85, 0.12)' }}>
                        <Typography sx={{ fontSize: '10px', color: '#DB4437', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Application Rejection Reason
                        </Typography>
                        <Typography sx={{ fontSize: '13.5px', color: '#DB4437', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                            {selectedApp.rejection_reason || "No rejection reason specified."}
                        </Typography>
                    </Box>
                )}

                {selectedApp.status === 'APPROVED' && (() => {
                    const registeredUser = users?.find(u => u.email.toLowerCase() === selectedApp.email.toLowerCase());
                    return (
                        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(76, 175, 80, 0.04)', border: '1px solid rgba(76, 175, 80, 0.12)' }}>
                            <Typography sx={{ fontSize: '10px', color: '#4CAF50', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Associated Registered User Profile
                            </Typography>
                            {registeredUser ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>User ID</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', mt: 0.5 }}>{registeredUser.id}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Employee ID</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{registeredUser.employee_id || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Department</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{registeredUser.department_name || 'General Clinic'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Account Status / Joined</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Chip label={registeredUser.is_active ? 'Active' : 'Inactive'} size="small" color={registeredUser.is_active ? 'success' : 'default'} sx={{ height: 18, fontSize: '9px', fontWeight: 700 }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(registeredUser.created_at).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                                    Invite issued but staff registration profile is still pending.
                                </Typography>
                            )}
                        </Box>
                    );
                })()}

                {/* Profile Grid Block */}
                <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                        Personal Profile Details
                    </Typography>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Email Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all', mt: 0.5 }}>{selectedApp.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Phone Number</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedApp.phone}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Experience (Clinical)</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedApp.experience_years} years</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Current Affiliation</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedApp.current_hospital || 'Not Specified'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>Specialization Area</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedApp.specialization}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px' }}>City</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{selectedApp.city}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                {/* Uploaded Documents */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                        Uploaded Document Credentials
                    </Typography>
                    
                    {/* PMDC Card */}
                    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 'none' }}>
                        <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'rgba(0,106,106,0.05)', color: '#006A6A', display: 'flex' }}>
                            <FileText size={20} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13.5px', fontFamily: "'Outfit', sans-serif" }}>PMDC Certificate Proof</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', mt: 0.25 }}>
                                {getFilename(selectedApp.pmdc_certificate)}
                            </Typography>
                        </Box>
                        <Button 
                            size="small"
                            component="a"
                            href={getMediaUrl(selectedApp.pmdc_certificate)}
                            target="_blank"
                            variant="outlined"
                            sx={{ borderRadius: '100px', fontWeight: 600, textTransform: 'none', borderColor: 'divider', color: 'text.primary', fontSize: '12px', px: 2.5 }}
                        >
                            Open
                        </Button>
                    </Card>

                    {/* CNIC Card */}
                    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '16px', boxShadow: 'none' }}>
                        <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'rgba(0,106,106,0.05)', color: '#006A6A', display: 'flex' }}>
                            <FileText size={20} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13.5px', fontFamily: "'Outfit', sans-serif" }}>CNIC ID Copy Proof</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', mt: 0.25 }}>
                                {getFilename(selectedApp.cnic_document)}
                            </Typography>
                        </Box>
                        <Button 
                            size="small"
                            component="a"
                            href={getMediaUrl(selectedApp.cnic_document)}
                            target="_blank"
                            variant="outlined"
                            sx={{ borderRadius: '100px', fontWeight: 600, textTransform: 'none', borderColor: 'divider', color: 'text.primary', fontSize: '12px', px: 2.5 }}
                        >
                            Open
                        </Button>
                    </Card>
                </Box>
            </DialogContent>
            
            <DialogActions 
                sx={{ 
                    p: 0, 
                    pt: 3, 
                    gap: 1.5, 
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    width: '100%',
                    justifyContent: 'space-between',
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
                        px: 3,
                        py: 1.1,
                        fontSize: '14px'
                    }}
                >
                    Close Panel
                </Button>
                {selectedApp.status === 'PENDING' && (
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1.5, 
                        flexDirection: { xs: 'column-reverse', sm: 'row' }, 
                        width: { xs: '100%', sm: 'auto' },
                        '& button': {
                            width: { xs: '100%', sm: 'auto' }
                        }
                    }}>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<X size={14} />}
                            onClick={() => openRejectConfirm(selectedApp)}
                            disabled={actionLoading}
                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, py: 1.1, fontSize: '14px' }}
                        >
                            Reject
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<Check size={14} />}
                            onClick={() => openApproveConfirm(selectedApp)}
                            disabled={actionLoading}
                            sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', px: 3, py: 1.1, fontSize: '14px' }}
                        >
                            Approve
                        </Button>
                    </Box>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ApplicationDetailsDialog;
