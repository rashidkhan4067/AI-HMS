import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';

export const CreateBedDialog = ({
    open,
    onClose,
    onSubmit,
    wards = [],
    bedWard,
    setBedWard,
    bedNumber,
    setBedNumber,
    bedSubmitting
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={() => !bedSubmitting && onClose()}
            slotProps={{
                paper: { sx: { borderRadius: '24px', p: 1, maxWidth: '400px', width: '100%' } }
            }}
        >
            <form onSubmit={onSubmit}>
                <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    Add Bed to Ward
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <FormControl fullWidth required>
                        <InputLabel>Select Ward</InputLabel>
                        <Select
                            value={bedWard}
                            onChange={(e) => setBedWard(e.target.value)}
                            label="Select Ward"
                        >
                            {wards.map(w => (
                                <MenuItem key={w.id} value={w.id}>{w.name} ({w.category})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Bed Number / Identifier"
                        value={bedNumber}
                        onChange={(e) => setBedNumber(e.target.value)}
                        fullWidth
                        required
                        helperText="e.g. B-101, Bed-15, etc."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={onClose}
                        disabled={bedSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={bedSubmitting}
                        sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}
                    >
                        {bedSubmitting ? 'Adding...' : 'Add Bed'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateBedDialog;
