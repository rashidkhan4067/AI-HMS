import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, 
    Typography, Grid, Paper, Chip, Divider, useTheme, Avatar
} from '@mui/material';
import { User, Calendar, Stethoscope, FileText, Pill, Clipboard, CheckCircle2, Printer, Activity } from 'lucide-react';
import { printPrescriptionStyles } from './PrintPrescriptionCss';

/**
 * MedicalRecordDetailsDialog — Premium detail viewer for patient clinical records.
 * Presents diagnostic documentation, prescription instructions, and treatment schedules.
 * Supports secure, official PDF/printout generation on A4 sheets.
 */
export const MedicalRecordDetailsDialog = ({ open, onClose, record }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (!record) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: '28px', 
                    p: 1.5,
                    bgcolor: isDark ? 'rgba(24, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: 'divider'
                }
            }}
        >
            {/* Inject dynamic print stylesheet */}
            <style dangerouslySetInnerHTML={{ __html: printPrescriptionStyles }} />

            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        Clinical Encounter Record
                    </Typography>
                    <Chip 
                        label="Finalized" 
                        color="success" 
                        size="small"
                        icon={<CheckCircle2 size={12} />}
                        sx={{ fontSize: '11px', fontWeight: 700 }}
                    />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    ID: {record.id.substring(0, 8)}...
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', maxHeight: '65vh' }}>
                
                {/* On-Screen/Printable Unified Area */}
                <Box id="printable-prescription-area" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    
                    {/* Printable-Only Letterhead Header */}
                    <Box sx={{ display: 'none', '@media print': { display: 'block', mb: 3 } }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={2}>
                                <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 56, height: 56 }}>
                                    <Activity size={32} />
                                </Avatar>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px' }}>
                                    AI HOSPITAL MANAGEMENT SYSTEM
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                                    123 Clinical Way, Health City Sector-4, Islamabad, PK
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                    Contact: +92 51 111-244-677 | email: operations@ai-hms.org
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ mt: 2, mb: 1, borderColor: 'primary.main', borderWidth: '1.5px' }} />
                    </Box>

                    {/* Patient & Doctor Demographics Grid */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Paper className="no-print-border" sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                                <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
                                    <User size={16} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Patient Details</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {record.patient_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>MRN: {record.patient_mrn}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        CNIC: {record.patient_cnic || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Age/DOB: {record.patient_dob ? new Date(record.patient_dob).toLocaleDateString() : 'N/A'} ({record.patient_gender || 'N/A'})
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper className="no-print-border" sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                                <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
                                    <Stethoscope size={16} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Physician Details</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        Dr. {record.doctor_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{record.doctor_specialization}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        PMDC License: {record.doctor_pmdc_number || 'REG-PENDING'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <Calendar size={12} style={{ color: 'gray' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 1, '@media print': { display: 'none' } }} />

                    {/* Diagnosis Block */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                            <Clipboard size={18} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                                Clinical Diagnosis
                            </Typography>
                        </Box>
                        <Paper className="no-print-border" variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                {record.diagnosis}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Treatment Plan */}
                    {record.treatment_plan && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <FileText size={18} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                                    Treatment Plan & Advice
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ px: 1, lineHeight: 1.6, color: 'text.primary' }}>
                                {record.treatment_plan}
                            </Typography>
                        </Box>
                    )}

                    {/* Prescription Section */}
                    {record.prescription && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <Pill size={18} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                                    Rx Formulas & Prescriptions
                                </Typography>
                            </Box>
                            <Paper className="no-print-border" variant="outlined" sx={{ p: 2, borderRadius: '16px', borderStyle: 'dashed', borderColor: 'primary.main', bgcolor: isDark ? 'rgba(0, 106, 106, 0.03)' : 'rgba(0, 106, 106, 0.01)' }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontFamily: "'Courier New', Courier, monospace", 
                                        fontWeight: 700, 
                                        whiteSpace: 'pre-line',
                                        color: 'primary.dark',
                                        lineHeight: 1.6,
                                        fontSize: '13.5px'
                                    }}
                                >
                                    Rx:
                                    {`\n`}{record.prescription}
                                </Typography>
                            </Paper>
                        </Box>
                    )}

                    {/* Confidential Internal Notes - Hide on Print (Only for screen preview of clinical staff) */}
                    {record.notes && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, '@media print': { display: 'none' } }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                                Confidential Clinician Notes (Hidden on Printout)
                            </Typography>
                            <Typography variant="body2" sx={{ px: 1, fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
                                "{record.notes}"
                            </Typography>
                        </Box>
                    )}

                    {/* Printable-Only Signature Section */}
                    <Box sx={{ display: 'none', '@media print': { display: 'block', mt: 6 } }}>
                        <Grid container justifyContent="space-between" alignItems="flex-end">
                            <Grid item xs={5}>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', borderTop: '1px solid gray', pt: 1, textAlign: 'center' }}>
                                    Patient Signature
                                </Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 700, fontStyle: 'italic', color: 'primary.main', mb: 1 }}>
                                    Dr. {record.doctor_name}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', borderTop: '1px solid gray', pt: 1, textAlign: 'center' }}>
                                    Physician Signature & Stamp
                                </Typography>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 5, p: 1.5, bgcolor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '10px' }}>
                                SECURE VERIFICATION ID: {record.id.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', fontSize: '9px', color: 'text.secondary' }}>
                                This is a digitally verified prescription. Any alterations make it legally void.
                            </Typography>
                        </Box>
                    </Box>

                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, gap: 1.5 }}>
                <Button 
                    onClick={handlePrint}
                    variant="outlined"
                    startIcon={<Printer size={16} />}
                    sx={{ 
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Print Prescription
                </Button>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    sx={{ 
                        borderRadius: '100px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        boxShadow: 'none'
                    }}
                >
                    Close Record
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MedicalRecordDetailsDialog;
