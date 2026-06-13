import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, FormControl, InputLabel, Select, 
    MenuItem, Alert, Box 
} from '@mui/material';

export const AdmitPatientDialog = ({
    open,
    onClose,
    onSubmit,
    patients = [],
    patientsLoading,
    doctors = [],
    doctorsLoading,
    beds = [],
    wards = [],
    selectedBed,
    admissionPatient,
    setAdmissionPatient,
    admissionDoctor,
    setAdmissionDoctor,
    admissionBed,
    setAdmissionBed,
    admissionReason,
    setAdmissionReason,
    admitSubmitting,
    admitError
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !admitSubmitting && onClose()}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '480px', width: '100%' } }
            }}
        >
            <form onSubmit={onSubmit}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Admit Patient (IPD)
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    {admitError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{admitError}</Alert>}

                    {/* Patient Dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel id="admit-patient-label">Select Patient</InputLabel>
                        <Select
                            labelId="admit-patient-label"
                            value={admissionPatient}
                            label="Select Patient"
                            onChange={(e) => setAdmissionPatient(e.target.value)}
                            disabled={patientsLoading}
                        >
                            {patientsLoading ? (
                                <MenuItem disabled>Loading patient directory...</MenuItem>
                            ) : patients.length === 0 ? (
                                <MenuItem disabled>No patients registered</MenuItem>
                            ) : (
                                patients.map(p => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.user?.full_name || 'Unknown'} (MRN: {p.mrn})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Attending Doctor Dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel id="admit-doctor-label">Attending Clinician</InputLabel>
                        <Select
                            labelId="admit-doctor-label"
                            value={admissionDoctor}
                            label="Attending Clinician"
                            onChange={(e) => setAdmissionDoctor(e.target.value)}
                            disabled={doctorsLoading}
                        >
                            {doctorsLoading ? (
                                <MenuItem disabled>Loading physicians...</MenuItem>
                            ) : doctors.length === 0 ? (
                                <MenuItem disabled>No doctors found</MenuItem>
                            ) : (
                                doctors.map(d => (
                                    <MenuItem key={d.id} value={d.id}>
                                        Dr. {d.user?.full_name} ({d.specialization})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Bed Dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel id="admit-bed-label">Bed Assignment</InputLabel>
                        <Select
                            labelId="admit-bed-label"
                            value={admissionBed}
                            label="Bed Assignment"
                            onChange={(e) => setAdmissionBed(e.target.value)}
                            disabled={selectedBed !== null}
                        >
                            {selectedBed ? (
                                <MenuItem value={selectedBed.id}>Bed {selectedBed.bed_number} ({wards.find(w=>w.id === selectedBed.ward)?.name})</MenuItem>
                            ) : (
                                beds.filter(b => b.status === 'AVAILABLE').map(b => (
                                    <MenuItem key={b.id} value={b.id}>
                                        Bed {b.bed_number} — {wards.find(w => w.id === b.ward)?.name || 'Unknown Ward'}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Reason for Admission"
                        value={admissionReason}
                        onChange={(e) => setAdmissionReason(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        required
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={onClose}
                        disabled={admitSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={admitSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        {admitSubmitting ? 'Admitting...' : 'Confirm Admission'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AdmitPatientDialog;
