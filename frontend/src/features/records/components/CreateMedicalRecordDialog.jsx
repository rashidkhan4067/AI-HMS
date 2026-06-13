import { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, 
    Typography, TextField, CircularProgress, Alert, useTheme,
    Select, MenuItem, FormControl, InputLabel, Card, IconButton, Divider, Chip, Grid
} from '@mui/material';
import { Stethoscope, Clipboard, FileText, Pill, AlertTriangle, Activity, Trash2, Plus, FlaskConical } from 'lucide-react';
import { recordsApi } from '../services/recordsApi';
import { schedulingApi } from '../../scheduling/services/schedulingApi';

/**
 * CreateMedicalRecordDialog — Clinical documentation wizard for treating doctors.
 * Requires documentation of diagnosis, plans, and scripts to complete and close appointments.
 */
export const CreateMedicalRecordDialog = ({ open, onClose, appointment, onSubmitSuccess }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Form states
    const [diagnosis, setDiagnosis] = useState('');
    const [treatmentPlan, setTreatmentPlan] = useState('');
    const [prescription, setPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const [vitalsExpanded, setVitalsExpanded] = useState(true);
    
    // Diagnostic ordering states
    const [orderedTests, setOrderedTests] = useState([]);
    const [tempCategory, setTempCategory] = useState('LAB');
    const [tempTestName, setTempTestName] = useState('');
    const [tempNotes, setTempNotes] = useState('');
    
    // Status states
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAddTest = () => {
        if (!tempTestName.trim()) return;
        setOrderedTests([
            ...orderedTests,
            {
                category: tempCategory,
                test_name: tempTestName.trim(),
                notes: tempNotes.trim()
            }
        ]);
        setTempTestName('');
        setTempNotes('');
    };

    const handleRemoveTest = (index) => {
        setOrderedTests(orderedTests.filter((_, idx) => idx !== index));
    };

    if (!appointment) return null;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!diagnosis.trim()) {
            setErrorMsg('A clinical diagnosis is required to complete this consultation record.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        try {
            // 1. Submit clinical medical record
            const recordPayload = {
                patient: appointment.patient,
                appointment: appointment.id,
                diagnosis: diagnosis.trim(),
                treatment_plan: treatmentPlan.trim(),
                prescription: prescription.trim(),
                notes: notes.trim()
            };
            await recordsApi.createRecord(recordPayload);

            // 2. Submit diagnostic orders if any
            if (orderedTests.length > 0) {
                await Promise.all(
                    orderedTests.map(test => 
                        recordsApi.createDiagnosticOrder({
                            patient: appointment.patient,
                            appointment: appointment.id,
                            category: test.category,
                            test_name: test.test_name,
                            notes: test.notes
                        })
                    )
                );
            }

            // 3. Transition appointment status to COMPLETED
            await schedulingApi.updateAppointmentStatus(appointment.id, 'COMPLETED');

            // 4. Reset form and fire callback
            setDiagnosis('');
            setTreatmentPlan('');
            setPrescription('');
            setNotes('');
            setOrderedTests([]);
            onSubmitSuccess();
            onClose();
        } catch (err) {
            setErrorMsg(
                err.response?.data?.detail || 
                err.response?.data?.non_field_errors?.[0] || 
                'Failed to submit documentation. Verify credentials and patient profile records.'
            );
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
            PaperProps={{
                sx: { 
                    borderRadius: '28px', 
                    p: 1.5,
                    bgcolor: isDark ? 'rgba(24, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Clinical Consultation Documentation
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Finalizing visit for patient: <strong>{appointment.patient_name || appointment.patient?.user?.full_name}</strong>
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {errorMsg && (
                    <Alert severity="error" icon={<AlertTriangle size={18} />} sx={{ borderRadius: '12px' }}>
                        {errorMsg}
                    </Alert>
                )}

                <Box component="form" id="documentation-form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Triage Vitals Reference Block */}
                    {appointment.vitals && (
                        <Box sx={{ 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            mb: 1
                        }}>
                            <Box 
                                onClick={() => setVitalsExpanded(!vitalsExpanded)}
                                sx={{ 
                                    p: 1.5, 
                                    bgcolor: 'action.hover', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                    <Activity size={16} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                        Triage Vitals Summary
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {vitalsExpanded ? 'Collapse' : 'Expand'}
                                </Typography>
                            </Box>
                            
                            {vitalsExpanded && (
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>BP</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{appointment.vitals.blood_pressure} mmHg</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>HR / Pulse</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{appointment.vitals.heart_rate} bpm</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Temp</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{appointment.vitals.temperature} °F</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>SpO2</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: appointment.vitals.spo2 < 95 ? 'error.main' : 'inherit' }}>
                                                {appointment.vitals.spo2} %
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Respiratory Rate</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {appointment.vitals.respiratory_rate ? `${appointment.vitals.respiratory_rate} rpm` : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Wt / Ht</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {appointment.vitals.weight ? `${appointment.vitals.weight}kg` : '-'}/{appointment.vitals.height ? `${appointment.vitals.height}cm` : '-'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Diagnosis (Required) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <Clipboard size={16} />
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Clinical Diagnosis (Required)
                            </Typography>
                        </Box>
                        <TextField
                            placeholder="Enter patient diagnosis summary..."
                            multiline
                            rows={3}
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            required
                            disabled={submitting}
                            sx={{ '& .MuiOutlinedInput-root': { py: 1.5 } }}
                        />
                    </Box>

                    {/* Treatment Advice */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <FileText size={16} />
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Treatment Plan & Clinical Advice
                            </Typography>
                        </Box>
                        <TextField
                            placeholder="Enter advise, therapies, or lifestyle instructions..."
                            multiline
                            rows={3}
                            value={treatmentPlan}
                            onChange={(e) => setTreatmentPlan(e.target.value)}
                            disabled={submitting}
                            sx={{ '& .MuiOutlinedInput-root': { py: 1.5 } }}
                        />
                    </Box>

                    {/* Prescriptions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <Pill size={16} />
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Active Prescriptions
                            </Typography>
                        </Box>
                        <TextField
                            placeholder="Rx: Drug name, dose, frequency, duration..."
                            multiline
                            rows={3}
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            disabled={submitting}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { py: 1.5 },
                                '& textarea': { fontFamily: 'monospace', fontSize: '13px' }
                            }}
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Diagnostic Tests Ordering Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <FlaskConical size={16} />
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Order Diagnostic Tests (Optional)
                            </Typography>
                        </Box>

                        {/* Test Selection Form */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '16px', bgcolor: 'action.hover' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="test-category-label">Category</InputLabel>
                                        <Select
                                            labelId="test-category-label"
                                            value={tempCategory}
                                            onChange={(e) => setTempCategory(e.target.value)}
                                            label="Category"
                                            disabled={submitting}
                                        >
                                            <MenuItem value="LAB">Lab Test</MenuItem>
                                            <MenuItem value="RADIOLOGY">Radiology Scan</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        label="Test / Scan Name"
                                        placeholder="e.g. CBC, Lipid Profile, Chest X-Ray"
                                        value={tempTestName}
                                        onChange={(e) => setTempTestName(e.target.value)}
                                        size="small"
                                        fullWidth
                                        disabled={submitting}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={10}>
                                    <TextField
                                        label="Instructions / Clinical Notes"
                                        placeholder="e.g. Fasting required, Check for fractures"
                                        value={tempNotes}
                                        onChange={(e) => setTempNotes(e.target.value)}
                                        size="small"
                                        fullWidth
                                        disabled={submitting}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'stretch' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleAddTest}
                                        disabled={!tempTestName.trim() || submitting}
                                        sx={{ width: '100%', borderRadius: '12px' }}
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* List of Ordered Tests */}
                        {orderedTests.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Tests to be Ordered:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {orderedTests.map((test, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: '12px',
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={test.category}
                                                        size="small"
                                                        color={test.category === 'LAB' ? 'primary' : 'secondary'}
                                                        sx={{ fontSize: '10px', height: '18px', fontWeight: 700 }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {test.test_name}
                                                    </Typography>
                                                </Box>
                                                {test.notes && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        Note: {test.notes}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveTest(index)}
                                                disabled={submitting}
                                                color="error"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Confidental Notes */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                            Internal Clinician Notes (Private)
                        </Typography>
                        <TextField
                            placeholder="Confidential comments, notes for future follow-up..."
                            multiline
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={submitting}
                            sx={{ '& .MuiOutlinedInput-root': { py: 1.5 } }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    disabled={submitting}
                    variant="outlined"
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    form="documentation-form"
                    disabled={submitting || !diagnosis.trim()}
                    variant="contained"
                    sx={{ 
                        borderRadius: '12px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)'
                    }}
                >
                    {submitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'white' }} />
                            Saving Note...
                        </Box>
                    ) : (
                        'Finalize & Complete Consult'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
