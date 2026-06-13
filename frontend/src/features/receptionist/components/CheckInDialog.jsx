import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogActions,
    Box, Typography, Button, Avatar, Divider,
    RadioGroup, FormControlLabel, Radio, Card,
    CircularProgress, Alert, TextField, MenuItem,
    FormControl, InputLabel, Checkbox
} from '@mui/material';
import { Check, Coins, CreditCard, Smartphone, X, Calendar, Clock, Award, ShieldAlert } from 'lucide-react';
import { receptionistApi } from '../services/receptionistApi';

export const CheckInDialog = ({ open, onClose, appointment, onSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paidAmount, setPaidAmount] = useState(0);
    const [insuranceAmount, setInsuranceAmount] = useState(0);
    const [insuranceProvider, setInsuranceProvider] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isPartial, setIsPartial] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const totalFee = appointment ? parseFloat(appointment.doctor_consultation_fee || 0) : 0;

    // Reset fields on open/close or appointment change
    useEffect(() => {
        if (appointment && open) {
            const fee = parseFloat(appointment.doctor_consultation_fee || 0);
            setPaidAmount(fee);
            setInsuranceAmount(0);
            setInsuranceProvider('');
            setDueDate('');
            setIsPartial(false);
            setPaymentMethod('CASH');
            setError(null);
        }
    }, [appointment, open]);

    // Handle payment method switch defaults
    useEffect(() => {
        if (appointment) {
            const fee = parseFloat(appointment.doctor_consultation_fee || 0);
            if (paymentMethod === 'CASH' || paymentMethod === 'CARD' || paymentMethod === 'MOBILE_PAY') {
                setPaidAmount(fee);
                setInsuranceAmount(0);
                setInsuranceProvider('');
                if (!isPartial) {
                    setDueDate('');
                }
            } else if (paymentMethod === 'INSURANCE') {
                setPaidAmount(0);
                setInsuranceAmount(fee);
                setDueDate('');
                setIsPartial(false);
            } else if (paymentMethod === 'MIXED') {
                setPaidAmount(fee / 2);
                setInsuranceAmount(fee / 2);
                if (!isPartial) {
                    setDueDate('');
                }
            }
        }
    }, [paymentMethod, appointment]);

    if (!appointment) return null;

    const remainingBalance = Math.max(0, totalFee - parseFloat(paidAmount || 0) - parseFloat(insuranceAmount || 0));
    const requiresDueDate = remainingBalance > 0 || isPartial;

    const handleCheckIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentPaid = parseFloat(paidAmount || 0);
            const currentIns = parseFloat(insuranceAmount || 0);
            const totalCollected = currentPaid + currentIns;

            let paymentStatus = 'PAID';
            if (totalCollected < totalFee) {
                paymentStatus = totalCollected > 0 ? 'PARTIALLY_PAID' : 'PENDING';
                if (!dueDate) {
                    setError('Due date is required for outstanding balances.');
                    setLoading(false);
                    return;
                }
            }

            await receptionistApi.createInvoice({
                appointment: appointment.id,
                patient: appointment.patient,
                amount: totalFee,
                paid_amount: currentPaid,
                insurance_amount: currentIns,
                insurance_provider: paymentMethod === 'INSURANCE' || paymentMethod === 'MIXED' ? insuranceProvider || 'OTHER' : null,
                due_date: requiresDueDate ? dueDate : null,
                payment_method: paymentMethod,
                payment_status: paymentStatus
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Check-in error:', err);
            setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'An error occurred during check-in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formattedTotalFee = totalFee.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const insuranceProvidersList = [
        { value: 'SEHAT_CARD', label: 'Sehat Sahulat Card (Govt)' },
        { value: 'STATE_LIFE', label: 'State Life Insurance' },
        { value: 'JUBILEE', label: 'Jubilee Life Insurance' },
        { value: 'EFU', label: 'EFU General Insurance' },
        { value: 'ASKARI', label: 'Askari General Insurance' },
        { value: 'TPL', label: 'TPL Insurance' },
        { value: 'OTHER', label: 'Other Panel / Insurance' }
    ];

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Avatar
                    sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        width: 44,
                        height: 44
                    }}
                >
                    <Check size={22} />
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '20px', lineHeight: 1.2 }}>
                        Patient Check-In
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '12px' }}>
                        Process billing split & confirm arrival
                    </Typography>
                </Box>
                {!loading && (
                    <Button onClick={onClose} sx={{ minWidth: 0, p: 0.5, borderRadius: '50%', color: 'text.secondary' }}>
                        <X size={20} />
                    </Button>
                )}
            </Box>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 0, maxHeight: '60vh', overflowY: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {/* Patient / Appointment info summary */}
                <Card sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Appointment Summary
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        {appointment.patient_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mb: 1.5 }}>
                        MRN: {appointment.patient_mrn}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Calendar size={15} style={{ color: 'gray' }} />
                            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                                {new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Clock size={15} style={{ color: 'gray' }} />
                            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                                {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            Dr. {appointment.doctor_name} ({appointment.doctor_specialization})
                        </Typography>
                    </Box>
                </Card>

                {/* Fee display */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '14px' }}>
                        Consultation Fee:
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '20px', color: 'primary.main', fontFamily: "'Outfit', sans-serif" }}>
                        PKR {formattedTotalFee}
                    </Typography>
                </Box>

                <Divider />

                {/* Payment method selector */}
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Select Payment Method
                    </Typography>
                    <RadioGroup
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                        {[
                            { value: 'CASH', icon: Coins, label: 'Cash Payment' },
                            { value: 'CARD', icon: CreditCard, label: 'Credit / Debit Card' },
                            { value: 'MOBILE_PAY', icon: Smartphone, label: 'Mobile Wallet (Easypaisa/JazzCash)' },
                            { value: 'INSURANCE', icon: Award, label: 'Insurance / Panel Coverage' },
                            { value: 'MIXED', icon: Award, label: 'Mixed (Cash/Card + Panel Cover)' }
                        ].map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.value;
                            return (
                                <Card 
                                    key={method.value}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 1.5, 
                                        borderRadius: '16px', 
                                        border: '1px solid', 
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        bgcolor: isSelected ? 'rgba(0, 106, 106, 0.04)' : 'background.paper',
                                        transition: 'all 0.2s',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <FormControlLabel
                                        value={method.value}
                                        control={<Radio size="small" />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Icon size={18} style={{ color: isSelected ? '#006A6A' : 'gray' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{method.label}</Typography>
                                            </Box>
                                        }
                                        sx={{ width: '100%', m: 0 }}
                                    />
                                </Card>
                            );
                        })}
                    </RadioGroup>
                </Box>

                {/* Sub-inputs based on payment methods */}
                {(paymentMethod === 'INSURANCE' || paymentMethod === 'MIXED') && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: '16px' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                            Panel Cover Details
                        </Typography>
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Insurance Panel Provider</InputLabel>
                            <MenuItem value="" disabled>Select Provider</MenuItem>
                            <TextField
                                select
                                label="Insurance Panel Provider"
                                value={insuranceProvider}
                                onChange={(e) => setInsuranceProvider(e.target.value)}
                                size="small"
                                fullWidth
                            >
                                {insuranceProvidersList.map(prov => (
                                    <MenuItem key={prov.value} value={prov.value}>{prov.label}</MenuItem>
                                ))}
                            </TextField>
                        </FormControl>

                        <TextField
                            label="Insurance Amount Covered (PKR)"
                            type="number"
                            size="small"
                            fullWidth
                            value={insuranceAmount}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setInsuranceAmount(Math.min(totalFee - (paymentMethod === 'MIXED' ? parseFloat(paidAmount || 0) : 0), Math.max(0, val)));
                            }}
                            inputProps={{ min: 0 }}
                        />
                    </Box>
                )}

                {/* Cash/Card portion input if Mixed is selected */}
                {paymentMethod === 'MIXED' && (
                    <TextField
                        label="Patient Cash/Card Paid Amount (PKR)"
                        type="number"
                        size="small"
                        fullWidth
                        value={paidAmount}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPaidAmount(Math.min(totalFee - parseFloat(insuranceAmount || 0), Math.max(0, val)));
                        }}
                        inputProps={{ min: 0 }}
                    />
                )}

                {/* Partial / Deferred payment options */}
                {(paymentMethod === 'CASH' || paymentMethod === 'CARD' || paymentMethod === 'MOBILE_PAY') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                        <Checkbox 
                            checked={isPartial} 
                            onChange={(e) => {
                                setIsPartial(e.target.checked);
                                if (!e.target.checked) {
                                    setPaidAmount(totalFee);
                                    setDueDate('');
                                } else {
                                    setPaidAmount(totalFee / 2); // default half
                                }
                            }}
                            size="small"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 550, color: 'text.secondary' }}>
                            Enable Partial / Deferred Payment
                        </Typography>
                    </Box>
                )}

                {isPartial && (paymentMethod === 'CASH' || paymentMethod === 'CARD' || paymentMethod === 'MOBILE_PAY') && (
                    <TextField
                        label="Amount Paid Now (PKR)"
                        type="number"
                        size="small"
                        fullWidth
                        value={paidAmount}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPaidAmount(Math.min(totalFee, Math.max(0, val)));
                        }}
                        inputProps={{ min: 0 }}
                    />
                )}

                {/* Due Date picker if there is a remaining balance */}
                {requiresDueDate && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, border: '1px solid', borderColor: 'warning.light', bgcolor: 'rgba(255, 152, 0, 0.02)', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                            <ShieldAlert size={16} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>
                                Remaining Balance Owed: PKR {remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                        
                        <TextField
                            label="Remaining Balance Due Date"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    p: 0,
                    pt: 3,
                    gap: 1.5,
                    width: '100%',
                    justifyContent: 'flex-end'
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.primary',
                        px: 3,
                        py: 1
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCheckIn}
                    variant="contained"
                    disabled={loading || (requiresDueDate && !dueDate)}
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Check size={14} />}
                    sx={{
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    Confirm & Check-In
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CheckInDialog;
