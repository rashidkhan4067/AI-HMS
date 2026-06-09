
import { 
    Box, Typography, Card, CardContent, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const AdminAudits = () => {
    const mockAudits = [
        { id: '1', email: 'rashidkhan4067@gmail.com', ip: '192.168.1.1', method: 'PASSWORD', success: true, reason: '-', time: '2026-06-09 08:34:44' },
        { id: '2', email: 'intruder@attack.com', ip: '203.0.113.5', method: 'PASSWORD', success: false, reason: 'Incorrect credentials (attempt 1/5)', time: '2026-06-09 08:12:00' },
        { id: '3', email: 'sarah.smith@alshifaa.com', ip: '192.168.1.42', method: 'GOOGLE', success: true, reason: '-', time: '2026-06-09 08:05:12' },
        { id: '4', email: 'lockedout@alshifaa.com', ip: '198.51.100.12', method: 'PASSWORD', success: false, reason: 'Account locked after 5 failed attempts', time: '2026-06-09 07:55:00' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    Security Audits & Login Trails
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Track all login operations, Google link events, and failed verification attempt triggers.
                </Typography>
            </Box>

            {/* Audits Card */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Audit Log Monitoring Feed
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Target Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Auth Method</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Security Notes</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Timestamp</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockAudits.map((log) => (
                                    <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: log.success ? 'success.main' : 'error.main' }}>
                                                {log.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{log.email}</TableCell>
                                        <TableCell>{log.ip}</TableCell>
                                        <TableCell>
                                            <Chip label={log.method} size="small" variant="outlined" color={log.method === 'GOOGLE' ? 'secondary' : 'default'} />
                                        </TableCell>
                                        <TableCell sx={{ color: log.success ? 'text.secondary' : 'error.main', fontSize: '13px' }}>{log.reason}</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '13px' }}>{log.time}</TableCell>
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
export default AdminAudits;
