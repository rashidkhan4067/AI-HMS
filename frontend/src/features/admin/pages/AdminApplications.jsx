import { useState } from 'react';
import { 
    Box, Typography, Card, CardContent, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { Check, X, FileText, Eye } from 'lucide-react';

export const AdminApplications = () => {
    const [selectedApp, setSelectedApp] = useState(null);

    const mockApps = [
        { id: '1', name: 'Dr. Alice Carter', email: 'alice.carter@test.com', phone: '+923001234567', pmdc: '98765-P', spec: 'Cardiology', exp: '8 years', status: 'PENDING' },
        { id: '2', name: 'Dr. Bob Johnson', email: 'bob.johnson@test.com', phone: '+923214567890', pmdc: '43210-P', spec: 'Pediatrics', exp: '12 years', status: 'PENDING' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    Doctor Onboarding Applications
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Review submitted doctor credentials, licensing PMDC certificates, and ID CNIC files.
                </Typography>
            </Box>

            {/* Applications List */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pending Reviews
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>PMDC Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockApps.map((app) => (
                                    <TableRow key={app.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ fontWeight: 600 }}>{app.name}</TableCell>
                                        <TableCell>{app.spec}</TableCell>
                                        <TableCell>{app.pmdc}</TableCell>
                                        <TableCell>{app.exp}</TableCell>
                                        <TableCell>
                                            <Chip label={app.status} size="small" color="warning" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<Eye size={14} />}
                                                    onClick={() => setSelectedApp(app)}
                                                >
                                                    Inspect Files
                                                </Button>
                                                <Button variant="contained" size="small" startIcon={<Check size={14} />}>Approve</Button>
                                                <Button variant="outlined" size="small" startIcon={<X size={14} />} color="error">Reject</Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Document Inspection Dialog */}
            <Dialog 
                open={!!selectedApp} 
                onClose={() => setSelectedApp(null)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { borderRadius: '24px' }
                    }
                }}
            >
                {selectedApp && (
                    <>
                        <DialogTitle sx={{ fontWeight: 600 }}>
                            Review Credentials: {selectedApp.name}
                        </DialogTitle>
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Personal Details</Typography>
                                <Typography variant="body2">Email: {selectedApp.email}</Typography>
                                <Typography variant="body2">Phone: {selectedApp.phone}</Typography>
                                <Typography variant="body2">Experience: {selectedApp.exp}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Uploaded Document Credentials</Typography>
                                
                                {/* PMDC Card */}
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, bgcolor: 'background.default' }}>
                                    <FileText size={24} color="#006A6A" />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>PMDC Certificate Proof</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>pmdc-cert-{selectedApp.pmdc}.pdf (2.4 MB)</Typography>
                                    </Box>
                                    <Button size="small">Download</Button>
                                </Card>

                                {/* CNIC Card */}
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, bgcolor: 'background.default' }}>
                                    <FileText size={24} color="#006A6A" />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>CNIC ID Copy Proof</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>cnic-doc-frontback.jpg (1.8 MB)</Typography>
                                    </Box>
                                    <Button size="small">Download</Button>
                                </Card>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={() => setSelectedApp(null)}>Close</Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button variant="outlined" color="error" startIcon={<X size={14} />}>Reject</Button>
                            <Button variant="contained" startIcon={<Check size={14} />}>Approve Onboarding</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};
export default AdminApplications;
