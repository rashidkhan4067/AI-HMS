
import { 
    Box, Typography, Card, CardContent, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Switch 
} from '@mui/material';

export const AdminUsers = () => {
    const mockUsers = [
        { id: '1', name: 'Dr. Rashid Khan', email: 'rashidkhan4067@gmail.com', role: 'ADMIN', active: true, joined: '2026-06-01' },
        { id: '2', name: 'Dr. Sarah Smith', email: 'sarah.smith@alshifaa.com', role: 'DOCTOR', active: true, joined: '2026-06-05' },
        { id: '3', name: 'Nurse Joy', email: 'nurse.joy@alshifaa.com', role: 'NURSE', active: false, joined: '2026-06-07' },
        { id: '4', name: 'John Doe (Patient)', email: 'patient.doe@example.com', role: 'PATIENT', active: true, joined: '2026-06-07' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    Active User Directories
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    View accounts, switch system access status, and manage user roles globally.
                </Typography>
            </Box>

            {/* Users Table */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        User Accounts Control Directory
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Assigned Role</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date Registered</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Active Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Approved Access</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockUsers.map((user) => (
                                    <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip label={user.role} size="small" variant="outlined" color="primary" />
                                        </TableCell>
                                        <TableCell>{user.joined}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.active ? 'Active' : 'Inactive'} 
                                                size="small" 
                                                color={user.active ? 'success' : 'default'} 
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Switch 
                                                checked={user.active} 
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};
export default AdminUsers;
