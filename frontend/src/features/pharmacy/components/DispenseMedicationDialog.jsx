import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    Typography, TextField, CircularProgress, Alert, Grid, Avatar, Divider
} from '@mui/material';
import { Pill, User, Clipboard, DollarSign, X, Check, FileText } from 'lucide-react';
import { pharmacyApi } from '../services/pharmacyApi';

export const DispenseMedicationDialog = ({ open, onClose, dispense, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (dispense) {
            setAmount(dispense.amount || '');
            setNotes(dispense.notes || '');
            setErrorMsg('');
        }
    }, [dispense]);

    if (!dispense) return null;

    const patientName = dispense.medical_record?.patient?.user?.full_name || 'N/A';
    const patientMrn = dispense.medical_record?.patient?.mrn || 'N/A';
    const doctorName = dispense.medical_record?.doctor?.user?.full_name || 'N/A';
    const prescriptionText = dispense.medical_record?.prescription || '';
    const diagnosis = dispense.medical_record?.diagnosis || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const cost = parseFloat(amount);
        if (isNaN(cost) || cost < 0) {
            setErrorMsg('Please enter a valid non-negative cost.');
            return;
        }

        setSubmitting(true);
        try {
            await pharmacyApi.dispensePrescription(dispense.id, {
                amount: cost.toFixed(2),
                notes: notes.trim(),
                status: 'DISPENSED'
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Dispensing error:', err);
            setErrorMsg(err.response?.data?.detail || err.response?.data?.amount?.[0] || err.response?.data?.notes?.[0] || 'Failed to complete dispense. Please check input values.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '24px',
                        p: { xs: 2, sm: 3 },
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 44, height: 44 }}>
                    <Pill size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Dispense Medication
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Patient: <strong>{patientName}</strong> (MRN: {patientMrn})
                    </Typography>
                </Box>
                {!submitting && (
                    <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, borderRadius: '50%', color: 'text.secondary' }}>
                        <X size={20} />
                    </Button>
                )}
            </Box>

            <DialogContent sx={{ p: 0, py: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {errorMsg && (
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                        {errorMsg}
                    </Alert>
                )}

                {/* Prescription Info Box */}
                <Box sx={{
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <User size={13} /> PRESCRIBED BY
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doctorName}
                        </Typography>
                    </Box>

                    {diagnosis && (
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Clipboard size={13} /> DIAGNOSIS
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {diagnosis}
                            </Typography>
                        </Box>
                    )}

                    <Divider />

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <FileText size={13} /> PRESCRIPTION RX
                        </Typography>
                        <Typography variant="body1" sx={{
                            fontWeight: 600,
                            fontFamily: "'Courier New', Courier, monospace",
                            whiteSpace: 'pre-wrap',
                            bgcolor: 'background.paper',
                            p: 1.5,
                            borderRadius: '8px',
                            border: '1px dashed',
                            borderColor: 'divider',
                            color: 'text.primary'
                        }}>
                            {prescriptionText}
                        </Typography>
                    </Box>
                </Box>

                {/* Form Fields */}
                <Box component="form" id="dispense-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Grid container spacing={2}>
                        {/* Medicine Cost */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DollarSign size={14} style={{ color: '#006A6A' }} /> Total Medicine Cost ($) *
                                </Typography>
                                <TextField
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Pharmacy Notes / Dispense Instructions */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clipboard size={14} /> Dispense Instructions & Notes
                                </Typography>
                                <TextField
                                    placeholder="Enter instructions (e.g. 'Take 1 tablet twice a day after meals')"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={submitting}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 3, gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    variant="outlined"
                    sx={{
                        borderRadius: '100px',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="dispense-form"
                    disabled={submitting}
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Check size={18} />}
                    sx={{
                        borderRadius: '100px',
                        px: 4,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 8px rgba(0, 106, 106, 0.15)'
                        }
                    }}
                >
                    Dispense & Bill
                </Button>
            </DialogActions>
        </Dialog>
    );
};
