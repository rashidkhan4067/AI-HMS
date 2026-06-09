import { 
    Box, Typography, Card, CardContent, Grid, 
    TextField, MenuItem, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export const AdminInvitations = () => {
    const mockInvites = [
        { id: '1', email: 'doctor.smith@alshifaa.com', role: 'DOCTOR', department: 'Cardiology', created: '2026-06-08', status: 'PENDING' },
        { id: '2', email: 'nurse.joy@alshifaa.com', role: 'NURSE', department: 'Pediatrics', created: '2026-06-07', status: 'PENDING' },
        { id: '3', email: 'reception.doe@alshifaa.com', role: 'RECEPTIONIST', department: 'Outpatient', created: '2026-06-05', status: 'EXPIRED' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    Staff Onboarding Invitations
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Issue security invitation tokens to clinical staff. Invited users must match the assigned email and role.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Generation Form */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '16px', position: 'sticky', top: 24 }}>
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Generate Invite Token
                            </Typography>
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField 
                                    label="Email Address" 
                                    placeholder="staff@alshifaa.com" 
                                    type="email"
                                    fullWidth
                                />
                                <TextField 
                                    select 
                                    label="Role Assignment" 
                                    defaultValue="DOCTOR"
                                    fullWidth
                                >
                                    <MenuItem value="DOCTOR">Doctor / Clinician</MenuItem>
                                    <MenuItem value="NURSE">Clinical Nurse</MenuItem>
                                    <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                                    <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
                                    <MenuItem value="LAB_TECHNICIAN">Lab Technician</MenuItem>
                                </TextField>
                                <TextField 
                                    select 
                                    label="Department" 
                                    defaultValue="Cardiology"
                                    fullWidth
                                >
                                    <MenuItem value="Cardiology">Cardiology</MenuItem>
                                    <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                                    <MenuItem value="Outpatient">Outpatient</MenuItem>
                                    <MenuItem value="Emergency">Emergency</MenuItem>
                                </TextField>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Plus size={18} />}
                                    sx={{ py: 1.5 }}
                                >
                                    Generate Link
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Listing Table */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Active Invitations
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'background.default' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Issued At</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockInvites.map((invite) => (
                                            <TableRow key={invite.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>{invite.email}</TableCell>
                                                <TableCell>
                                                    <Chip label={invite.role} size="small" variant="outlined" color="primary" />
                                                </TableCell>
                                                <TableCell>{invite.department}</TableCell>
                                                <TableCell>{invite.created}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={invite.status} 
                                                        size="small" 
                                                        color={invite.status === 'PENDING' ? 'warning' : 'default'} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button size="small" startIcon={<RefreshCw size={14} />}>Resend</Button>
                                                        <Button size="small" startIcon={<Trash2 size={14} />} color="error">Revoke</Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
export default AdminInvitations;
