import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    Typography, TextField, CircularProgress, Alert, Grid, Avatar
} from '@mui/material';
import { Clipboard, Heart, Thermometer, Wind, Eye, Scale, Ruler, X, Check } from 'lucide-react';
import { nurseApi } from '../services/nurseApi';

export const VitalsLoggingDialog = ({ open, onClose, appointment, onSuccess }) => {
    // Form fields
    const [bp, setBp] = useState('');
    const [hr, setHr] = useState('');
    const [temp, setTemp] = useState('');
    const [spo2, setSpo2] = useState('');
    const [respRate, setRespRate] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    // State managers
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!appointment) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // Basic validations
        const bpRegex = /^\d{2,3}\/\d{2,3}$/;
        if (!bpRegex.test(bp.trim())) {
            setErrorMsg('Blood pressure must be in "Systolic/Diastolic" format (e.g. 120/80).');
            return;
        }

        const hrNum = parseInt(hr);
        if (isNaN(hrNum) || hrNum < 30 || hrNum > 250) {
            setErrorMsg('Please enter a valid heart rate (30 - 250 bpm).');
            return;
        }

        const tempNum = parseFloat(temp);
        if (isNaN(tempNum) || tempNum < 80 || tempNum > 115) {
            setErrorMsg('Please enter a valid temperature (80 - 115 °F).');
            return;
        }

        const spo2Num = parseInt(spo2);
        if (isNaN(spo2Num) || spo2Num < 50 || spo2Num > 100) {
            setErrorMsg('Please enter a valid oxygen saturation (50 - 100 %).');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                appointment: appointment.id,
                patient: appointment.patient,
                blood_pressure: bp.trim(),
                heart_rate: hrNum,
                temperature: tempNum.toFixed(1),
                spo2: spo2Num,
                respiratory_rate: respRate ? parseInt(respRate) : null,
                weight: weight ? parseFloat(weight).toFixed(2) : null,
                height: height ? parseFloat(height).toFixed(2) : null
            };

            await nurseApi.createVitals(payload);
            
            // Clear fields & trigger success
            setBp('');
            setHr('');
            setTemp('');
            setSpo2('');
            setRespRate('');
            setWeight('');
            setHeight('');
            
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Vitals logging error:', err);
            setErrorMsg(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit vitals. Please check inputs.');
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 44, height: 44 }}>
                    <Clipboard size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Log Patient Vitals
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Triage patient: <strong>{appointment.patient_name}</strong> (MRN: {appointment.patient_mrn})
                    </Typography>
                </Box>
                {!submitting && (
                    <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, borderRadius: '50%', color: 'text.secondary' }}>
                        <X size={20} />
                    </Button>
                )}
            </Box>

            <DialogContent sx={{ p: 0, py: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {errorMsg && (
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                        {errorMsg}
                    </Alert>
                )}

                <Box component="form" id="vitals-form" onSubmit={handleSubmit}>
                    <Grid container spacing={2.5}>
                        {/* Blood Pressure */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clipboard size={14} style={{ color: '#006A6A' }} /> Blood Pressure (mmHg) *
                                </Typography>
                                <TextField
                                    placeholder="e.g. 120/80"
                                    value={bp}
                                    onChange={(e) => setBp(e.target.value)}
                                    required
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Heart Rate */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Heart size={14} style={{ color: '#E91E63' }} /> Pulse / Heart Rate (bpm) *
                                </Typography>
                                <TextField
                                    placeholder="e.g. 72"
                                    type="number"
                                    value={hr}
                                    onChange={(e) => setHr(e.target.value)}
                                    required
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Temperature */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Thermometer size={14} style={{ color: '#FF9800' }} /> Body Temperature (°F) *
                                </Typography>
                                <TextField
                                    placeholder="e.g. 98.6"
                                    type="number"
                                    inputProps={{ step: "0.1" }}
                                    value={temp}
                                    onChange={(e) => setTemp(e.target.value)}
                                    required
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* SpO2 */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Wind size={14} style={{ color: '#2196F3' }} /> SpO2 Oxygen Saturation (%) *
                                </Typography>
                                <TextField
                                    placeholder="e.g. 98"
                                    type="number"
                                    value={spo2}
                                    onChange={(e) => setSpo2(e.target.value)}
                                    required
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Respiratory Rate */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Wind size={14} style={{ color: '#9C27B0' }} /> Respiratory Rate (breaths/min)
                                </Typography>
                                <TextField
                                    placeholder="e.g. 16"
                                    type="number"
                                    value={respRate}
                                    onChange={(e) => setRespRate(e.target.value)}
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Weight */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Scale size={14} style={{ color: '#607D8B' }} /> Body Weight (kg)
                                </Typography>
                                <TextField
                                    placeholder="e.g. 70.5"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Height */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Ruler size={14} style={{ color: '#795548' }} /> Patient Height (cm)
                                </Typography>
                                <TextField
                                    placeholder="e.g. 175"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    disabled={submitting}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 0, pt: 3, gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={submitting}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="vitals-form"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <Check size={14} />}
                    sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
                >
                    Save Vitals & Complete Triage
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VitalsLoggingDialog;
