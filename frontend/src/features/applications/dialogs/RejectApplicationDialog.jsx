import React from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, TextField, Box, Typography, Chip, Avatar } from '@mui/material';
import { AlertCircle } from 'lucide-react';

const defaultPresets = [
    "PMDC licensing credentials could not be verified.",
    "Incorrect or expired CNIC identification card document copy.",
    "Clinical experience details do not meet minimum hospital requirements.",
    "Specialization credentials mismatched with applicant's registration code."
];

export const RejectApplicationDialog = ({ 
    open, 
    onClose, 
    app, 
    reason, 
    onReasonChange, 
    error, 
    onConfirm, 
    actionLoading, 
    presets = defaultPresets 
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
            {app && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar 
                            sx={{ 
                                bgcolor: 'rgba(219, 68, 85, 0.08)', 
                                color: '#DB4437',
                                width: 44,
                                height: 44
                            }}
                        >
                            <AlertCircle size={24} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2 }}>
                                Decline Application
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                                Reject Dr. {app.full_name}'s Profile
                            </Typography>
                        </Box>
                    </Box>

                    <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <DialogContentText sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', lineHeight: 1.5 }}>
                            Specify why this onboarding application was declined. This notification reason will be emailed directly to the applicant's address.
                        </DialogContentText>
                        
                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            label="Decline Reason"
                            placeholder="Provide details on required amendments or credential status..."
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            error={!!error}
                            helperText={error}
                            required
                            slotProps={{
                                input: {
                                    sx: { borderRadius: '16px', py: 1.5 }
                                }
                            }}
                        />

                        {/* Preset Buttons */}
                        <Box>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    fontWeight: 700, 
                                    color: 'text.secondary', 
                                    display: 'block', 
                                    mb: 1.25, 
                                    textTransform: 'uppercase', 
                                    fontSize: '9.5px', 
                                    letterSpacing: '0.5px' 
                                }}
                            >
                                Quick Templates:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {presets.map((preset, idx) => (
                                    <Chip 
                                        key={idx}
                                        label={preset.slice(0, 32) + '...'}
                                        onClick={() => onReasonChange(preset)}
                                        size="small"
                                        variant="outlined"
                                        clickable
                                        sx={{ 
                                            fontSize: '11px', 
                                            height: 26, 
                                            borderRadius: '8px',
                                            borderColor: 'divider',
                                            bgcolor: 'background.default',
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
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
                            onClick={onConfirm} 
                            variant="contained" 
                            disabled={actionLoading}
                            sx={{ 
                                borderRadius: '100px', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                boxShadow: 'none',
                                bgcolor: '#DB4437',
                                color: '#fff',
                                px: 3.5,
                                py: 1.1,
                                fontSize: '14px',
                                '&:hover': {
                                    bgcolor: '#c53929',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {actionLoading ? 'Declining...' : 'Decline Application'}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default RejectApplicationDialog;
