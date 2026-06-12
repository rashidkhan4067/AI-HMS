import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Typography, Chip, Button, Divider, Avatar } from '@mui/material';
import { CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
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

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

export const AuditDetailsDialog = ({ open, onClose, selectedAudit, users = [], applications = [] }) => {
    if (!selectedAudit) return null;

    const isSuccess = selectedAudit.success;

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
                        bgcolor: isSuccess ? 'rgba(76, 175, 80, 0.08)' : 'rgba(219, 68, 85, 0.08)', 
                        color: isSuccess ? '#4CAF50' : '#DB4437',
                        width: 44,
                        height: 44
                    }}
                >
                    {isSuccess ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2 }}>
                        Security Audit Details
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Gatekeeper Authentication Trail
                    </Typography>
                </Box>
            </Box>
            
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0, overflowY: 'auto', maxHeight: '60vh' }}>
                
                {/* Event ID */}
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '10px' }}>
                        Event Trace Identifier
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1.75, py: 1, borderRadius: '12px', border: '1px solid', borderColor: 'divider', fontSize: '12px', wordBreak: 'break-all', color: 'text.secondary' }}>
                        {selectedAudit.id}
                    </Typography>
                </Box>

                {/* Audit Grid Block */}
                <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Attempted Email</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, wordBreak: 'break-all' }}>{selectedAudit.email_attempted}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>IP Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedAudit.ip_address || '127.0.0.1'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Authentication Method</Typography>
                            <Box sx={{ mt: 0.75 }}>
                                <Chip 
                                    label={selectedAudit.login_method} 
                                    size="small" 
                                    variant="outlined" 
                                    color={selectedAudit.login_method === 'GOOGLE' ? 'secondary' : 'default'} 
                                    sx={{ fontSize: '10px', fontWeight: 600, borderRadius: '6px', height: 22 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Timestamp</Typography>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", mt: 0.5, color: 'text.secondary', fontSize: '13px' }}>
                                {formatDateTime(selectedAudit.timestamp)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {(() => {
                    const registeredUser = users?.find(u => u.email.toLowerCase() === selectedAudit.email_attempted.toLowerCase());
                    const doctorApp = registeredUser?.role === 'DOCTOR'
                        ? applications?.find(app => app.email.toLowerCase() === registeredUser.email.toLowerCase())
                        : null;

                    if (!registeredUser) return null;

                    return (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                                    Associated User Account Profile
                                </Typography>
                                <Box sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Full Name</Typography>
                                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{registeredUser.full_name}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Employee ID / Role</Typography>
                                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{registeredUser.employee_id || '-'} ({registeredUser.role})</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Department</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, mt: 0.5 }}>{registeredUser.department_name || 'General Clinic'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Account Status</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip label={registeredUser.is_active ? 'ACTIVE' : 'INACTIVE'} size="small" color={registeredUser.is_active ? 'success' : 'default'} sx={{ height: 20, fontSize: '9px', fontWeight: 700 }} />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>

                            {doctorApp && (
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, fontSize: '11px' }}>
                                        Approved Doctor Credentials Review
                                    </Typography>
                                    <Box sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>PMDC Reg # / Specialization</Typography>
                                                <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.pmdc_number} ({doctorApp.specialization})</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Experience / Affiliation</Typography>
                                                <Typography sx={{ fontSize: '13.5px', fontWeight: 700, mt: 0.5 }}>{doctorApp.experience_years} Yrs ({doctorApp.current_hospital || 'Private practice'})</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                                        <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', fontFamily: "'DM Sans', sans-serif" }}>
                                                            PMDC Cert: {getFilename(doctorApp.pmdc_certificate)}
                                                        </Typography>
                                                        <Button size="small" component="a" href={getMediaUrl(doctorApp.pmdc_certificate)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.default' }}>
                                                        <Typography sx={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', fontFamily: "'DM Sans', sans-serif" }}>
                                                            CNIC ID: {getFilename(doctorApp.cnic_document)}
                                                        </Typography>
                                                        <Button size="small" component="a" href={getMediaUrl(doctorApp.cnic_document)} target="_blank" variant="text" sx={{ py: 0.5, minWidth: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>Open</Button>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            )}
                        </>
                    );
                })()}

                <Divider />

                {/* Status Message / Security Assessment */}
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, fontSize: '11px' }}>
                        Security Audit Assessment
                    </Typography>
                    
                    {isSuccess ? (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(76, 175, 80, 0.04)', border: '1px solid rgba(76, 175, 80, 0.12)', borderRadius: '20px' }}>
                            <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                                ✅ Success: The login credentials and authentication factor were successfully verified. Session JWT tokens were issued and securely stored in HTTP-Only cookies. No action is required.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(219, 68, 85, 0.04)', border: '1px solid rgba(219, 68, 85, 0.12)', borderRadius: '20px' }}>
                            <Typography variant="body2" sx={{ color: '#DB4437', fontWeight: 700, mb: 1, fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                                ⚠️ Failure: {selectedAudit.failure_reason}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#DB4437', opacity: 0.95, display: 'block', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                                {selectedAudit.failure_reason?.toLowerCase().includes('locked') && 
                                    "Security Note: The target user account has reached maximum failed login attempts and has been locked to prevent brute-force dictionary attacks."}
                                {selectedAudit.failure_reason?.toLowerCase().includes('rate limit') && 
                                    "Security Note: The API rate-limiting middleware throttled this connection to prevent denial of service (DoS) or script-based password cracking."}
                                {selectedAudit.failure_reason?.toLowerCase().includes('not registered') && 
                                    "Security Note: A login attempt was made using an email address that does not exist in the patient or clinical staff registry."}
                                {selectedAudit.failure_reason?.toLowerCase().includes('inactive') && 
                                    "Security Note: This account is registered but inactive. An administrator must review and activate the account before login is permitted."}
                                {!(selectedAudit.failure_reason?.toLowerCase().includes('locked') || selectedAudit.failure_reason?.toLowerCase().includes('rate limit') || selectedAudit.failure_reason?.toLowerCase().includes('not registered') || selectedAudit.failure_reason?.toLowerCase().includes('inactive')) && 
                                    "Security Note: Incorrect password attempt. Repeated failures will trigger automatic IP rate limits and temporary account lockout."}
                            </Typography>
                        </Box>
                    )}
                </Box>
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
                        fontSize: '14px'
                    }}
                >
                    Dismiss Audit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuditDetailsDialog;
