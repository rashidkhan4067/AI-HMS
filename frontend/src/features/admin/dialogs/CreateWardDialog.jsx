import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';

export const CreateWardDialog = ({
    open,
    onClose,
    onSubmit,
    wardName,
    setWardName,
    wardCategory,
    setWardCategory,
    wardRate,
    setWardRate,
    wardDept,
    setWardDept,
    departments = [],
    wardSubmitting
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !wardSubmitting && onClose()}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '400px', width: '100%' } }
            }}
        >
            <form onSubmit={onSubmit}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Register New Ward
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <TextField
                        label="Ward Name"
                        value={wardName}
                        onChange={(e) => setWardName(e.target.value)}
                        fullWidth
                        required
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={wardCategory}
                            onChange={(e) => setWardCategory(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="GENERAL">General Ward</MenuItem>
                            <MenuItem value="PRIVATE">Private Room</MenuItem>
                            <MenuItem value="ICU">Intensive Care Unit (ICU)</MenuItem>
                            <MenuItem value="CCU">Coronary Care Unit (CCU)</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Daily Rate (PKR)"
                        type="number"
                        value={wardRate}
                        onChange={(e) => setWardRate(e.target.value)}
                        fullWidth
                        required
                    />

                    <FormControl fullWidth>
                        <InputLabel>Department Link</InputLabel>
                        <Select
                            value={wardDept}
                            onChange={(e) => setWardDept(e.target.value)}
                            label="Department Link"
                        >
                            <MenuItem value="">No Department Link</MenuItem>
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={onClose}
                        disabled={wardSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={wardSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        {wardSubmitting ? 'Registering...' : 'Register'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateWardDialog;
