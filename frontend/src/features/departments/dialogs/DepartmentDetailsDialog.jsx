import React from 'react';
import { 
    Dialog, DialogContent, Box, Typography, Button, Chip, 
    Divider, IconButton, Avatar, useTheme 
} from '@mui/material';
import { FileText, MapPin, Phone, Calendar, Users, Trash2, Pencil, X } from 'lucide-react';
import { formatDate as formatDateShared } from '../../../shared/utils/dateUtils';

export const DepartmentDetailsDialog = ({ 
    open, 
    onClose, 
    department,
    onEdit,
    onDelete
}) => {
    const theme = useTheme();
    if (!department) return null;
    
    const hasStaff = (department.staff_count || 0) > 0;

    const getDeptColor = (name) => {
        const colors = [
            '#006A6A', '#4A6363', '#895100', '#6B5778',
            '#3F6373', '#5E6135', '#7B4E3E', '#2B6355'
        ];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const color = getDeptColor(department.name);

    const formatDate = (dateString) => formatDateShared(dateString, { hour: '2-digit', minute: '2-digit', fallback: '—' });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: { 
                        borderRadius: { xs: '20px', sm: '28px' }, 
                        m: { xs: 1.5, sm: 2 },
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }
                }
            }}
        >
            {/* Header Banner */}
            <Box sx={{ 
                position: 'relative',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(156,241,240,0.04)' : 'rgba(0,106,106,0.03)',
                px: { xs: 2.5, sm: 3 },
                pt: { xs: 2.5, sm: 3 },
                pb: 3
            }}>
                {/* Close Button */}
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <X size={18} />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                        sx={{ 
                            width: 56, height: 56, 
                            bgcolor: `${color}18`, 
                            color: color,
                            fontSize: '22px', 
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif"
                        }}
                    >
                        {department.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            fontFamily: "'Outfit', sans-serif", 
                            fontSize: '20px', 
                            lineHeight: 1.2,
                            mb: 0.5
                        }}>
                            {department.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={department.code || 'NO CODE'}
                                size="small"
                                sx={{ 
                                    fontSize: '10px', 
                                    fontWeight: 700, 
                                    height: '22px',
                                    bgcolor: 'action.selected',
                                    color: 'text.primary',
                                    fontFamily: "'Outfit', sans-serif"
                                }}
                            />
                            <Chip 
                                icon={<Users size={12} />}
                                label={`${department.staff_count || 0} staff`}
                                size="small"
                                color={hasStaff ? 'primary' : 'default'}
                                variant={hasStaff ? 'filled' : 'outlined'}
                                sx={{ 
                                    fontSize: '11px', 
                                    fontWeight: 600, 
                                    height: '22px',
                                    '& .MuiChip-icon': { fontSize: '12px' }
                                }}
                            />
                            <Chip 
                                label={department.is_active ? "Active" : "Inactive"}
                                size="small"
                                variant="outlined"
                                color={department.is_active ? "success" : "default"}
                                sx={{ fontSize: '11px', fontWeight: 600, height: '22px' }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
                {/* Info Sections */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    
                    {/* Description Section */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FileText size={14} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="overline" sx={{ 
                                fontWeight: 700, 
                                color: 'text.secondary', 
                                fontSize: '11px',
                                letterSpacing: '0.8px',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Description
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                            color: department.description ? 'text.primary' : 'text.disabled',
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.7,
                            fontSize: '14px',
                            pl: 0.5
                        }}>
                            {department.description || 'No description provided for this department.'}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Clinic Details (Location & Contact) */}
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                        gap: 2 
                    }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                <MapPin size={14} style={{ color: theme.palette.text.secondary }} />
                                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '11px', letterSpacing: '0.8px' }}>
                                    Location / Wing
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '14px', pl: 0.5, fontWeight: 500, color: department.location ? 'text.primary' : 'text.disabled' }}>
                                {department.location || 'Not specified'}
                            </Typography>
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                <Phone size={14} style={{ color: theme.palette.text.secondary }} />
                                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '11px', letterSpacing: '0.8px' }}>
                                    Contact Extension
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '14px', pl: 0.5, fontWeight: 500, color: department.contact_number ? 'text.primary' : 'text.disabled' }}>
                                {department.contact_number || 'Not specified'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Audit Dates History */}
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                        gap: 2 
                    }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Calendar size={13} style={{ color: theme.palette.text.secondary }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Created At
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', pl: 0.5, color: 'text.primary' }}>
                                {formatDate(department.created_at)}
                            </Typography>
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Calendar size={13} style={{ color: theme.palette.text.secondary }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Last Updated
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', pl: 0.5, color: 'text.primary' }}>
                                {formatDate(department.updated_at)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            {/* Action Buttons */}
            <Box sx={{ 
                px: { xs: 2.5, sm: 3 }, 
                pb: { xs: 2.5, sm: 3 }, 
                pt: 0.5,
                display: 'flex', 
                gap: 1.5, 
                justifyContent: 'flex-end',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                '& button': {
                    width: { xs: '100%', sm: 'auto' }
                }
            }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={15} />}
                    onClick={() => onDelete(department)}
                    disabled={hasStaff}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        px: 2.5,
                        py: 0.9,
                        fontSize: '13px',
                        borderColor: hasStaff ? 'divider' : 'error.main',
                    }}
                >
                    Delete
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Pencil size={15} />}
                    onClick={() => onEdit(department)}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        boxShadow: 'none',
                        px: 2.5,
                        py: 0.9,
                        fontSize: '13px',
                        '&:hover': { boxShadow: 'none' }
                    }}
                >
                    Edit Department
                </Button>
            </Box>
        </Dialog>
    );
};

export default DepartmentDetailsDialog;
