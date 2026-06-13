import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, TextField, FormControl, InputLabel, 
    Select, MenuItem, Alert, Box 
} from '@mui/material';

export const UpdateDoctorComplianceDialog = ({ 
    open, 
    onClose, 
    doctor, 
    expiryDate, 
    setExpiryDate, 
    licenseStatus, 
    setLicenseStatus, 
    submitting, 
    successMessage, 
    formError, 
    onSubmit 
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !submitting && onClose()}
            slotProps={{
                paper: {
                    sx: { borderRadius: '24px', p: 1, maxWidth: '440px', width: '100%' }
                }
            }}
        >
            <form onSubmit={onSubmit}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Update PMDC License Status
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    {successMessage && <Alert severity="success" sx={{ borderRadius: '12px' }}>{successMessage}</Alert>}
                    {formError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{formError}</Alert>}

                    <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                        Update registration details for <strong>Dr. {doctor?.doctor_name}</strong>. Check documentation carefully before saving.
                    </Typography>

                    <TextField
                        label="PMDC Expiry Date"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <FormControl fullWidth>
                        <InputLabel id="dialog-status-label">License Status</InputLabel>
                        <Select
                            labelId="dialog-status-label"
                            value={licenseStatus}
                            label="License Status"
                            onChange={(e) => setLicenseStatus(e.target.value)}
                            required
                        >
                            <MenuItem value="ACTIVE">Active (Compliant)</MenuItem>
                            <MenuItem value="PENDING_RENEWAL">Pending Renewal</MenuItem>
                            <MenuItem value="EXPIRED">Expired (Suspended)</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={onClose}
                        disabled={submitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={submitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdateDoctorComplianceDialog;
