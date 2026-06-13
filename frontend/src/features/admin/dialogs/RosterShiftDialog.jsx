import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert 
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

export const RosterShiftDialog = ({
    open,
    onClose,
    onSubmit,
    selectedRoster,
    staffId,
    setStaffId,
    deptId,
    setDeptId,
    shiftStart,
    setShiftStart,
    shiftEnd,
    setShiftEnd,
    notes,
    setNotes,
    activeStaff = [],
    departments = [],
    roleLabels = {},
    submitting,
    successMessage,
    formError
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !submitting && onClose()}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '440px', width: '100%' } }
            }}
        >
            <form onSubmit={onSubmit}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    {selectedRoster ? 'Edit Shift Assignment' : 'Schedule Shift Assignment'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    {successMessage && <Alert severity="success" sx={{ borderRadius: '12px' }}>{successMessage}</Alert>}
                    {formError && (
                        <Alert severity="error" icon={<AlertTriangle size={16} />} sx={{ borderRadius: '12px' }}>
                            {formError}
                        </Alert>
                    )}

                    {/* Staff Member dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel id="roster-staff-label">Staff Member</InputLabel>
                        <Select
                            labelId="roster-staff-label"
                            value={staffId}
                            label="Staff Member"
                            onChange={(e) => setStaffId(e.target.value)}
                            disabled={selectedRoster !== null}
                        >
                            {activeStaff.length === 0 ? (
                                <MenuItem disabled>No active staff members found</MenuItem>
                            ) : (
                                activeStaff.map(u => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.full_name} ({roleLabels[u.role] || u.role})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Department dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel id="roster-dept-label">Department</InputLabel>
                        <Select
                            labelId="roster-dept-label"
                            value={deptId}
                            label="Department"
                            onChange={(e) => setDeptId(e.target.value)}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Shift Start"
                        type="datetime-local"
                        value={shiftStart}
                        onChange={(e) => setShiftStart(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <TextField
                        label="Shift End"
                        type="datetime-local"
                        value={shiftEnd}
                        onChange={(e) => setShiftEnd(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <TextField
                        label="Notes / Instructions"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="e.g. On-call overnight rotation"
                    />
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
                        {submitting ? 'Saving...' : 'Save Shift'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default RosterShiftDialog;
