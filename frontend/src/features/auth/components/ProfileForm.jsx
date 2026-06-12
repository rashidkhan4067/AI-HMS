import { useState } from 'react';
import { TextField, Box, Card, Typography, Button, Divider, InputAdornment, Avatar } from '@mui/material';
import { User, Mail, Phone, Edit2, Camera } from 'lucide-react';
import { LoadingButton } from '../../../shared/components/ui';

// Utility to fetch name initials
const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * ProfileForm — Sub-component rendering the Google Account-style "Basic info" card.
 * Handles display rows in horizontal flex layouts, responsive stacking on mobile,
 * and seamless edit state transitions with input start adornments.
 */
export const ProfileForm = ({ initialData, onSave, isLoading, error }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        phone:      initialData?.phone      || '',
    });

    const [prevInitialData, setPrevInitialData] = useState(initialData);

    // Sync form when parent loads fresh profile data
    if (initialData !== prevInitialData) {
        setFormData({
            full_name: initialData?.full_name || '',
            phone:      initialData?.phone      || '',
        });
        setPrevInitialData(initialData);
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            full_name: initialData?.full_name || '',
            phone:      initialData?.phone      || '',
        });
        setIsEditing(false);
    };

    return (
        <Card 
            sx={{ 
                borderRadius: '20px', 
                border: '1px solid', 
                borderColor: 'divider',
                boxShadow: 'none',
                overflow: 'hidden'
            }}
        >
            <Box 
                sx={{ 
                    p: { xs: 2.5, sm: 4 }, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700, 
                            fontFamily: "'Outfit', sans-serif", 
                            fontSize: '18px',
                            color: 'text.primary'
                        }}
                    >
                        Basic info
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary', 
                            fontFamily: "'DM Sans', sans-serif", 
                            fontSize: '13.5px', 
                            mt: 0.5 
                        }}
                    >
                        Some info may be visible to other members using the Al Shifaa directory.
                    </Typography>
                </Box>
                {!isEditing && (
                    <Button
                        variant="outlined"
                        startIcon={<Edit2 size={14} />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                            borderRadius: '100px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                            py: 0.75,
                            fontSize: '13px',
                            borderColor: 'divider',
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'text.secondary'
                            }
                        }}
                    >
                        Edit
                    </Button>
                )}
            </Box>

            {error && (
                <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: 3 }}>
                    <Typography 
                        variant="body2" 
                        color="error.main" 
                        sx={{ 
                            fontWeight: 600, 
                            bgcolor: 'rgba(219, 68, 85, 0.05)', 
                            p: 1.5, 
                            borderRadius: '12px', 
                            border: '1px solid rgba(219, 68, 85, 0.12)' 
                        }}
                    >
                        {error.detail || error.message || 'Failed to update profile. Please verify details.'}
                    </Typography>
                </Box>
            )}

            {!isEditing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Profile Picture Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: { xs: 2, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Profile picture
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary', 
                                fontFamily: "'DM Sans', sans-serif",
                                flexGrow: 1,
                                fontSize: '13px'
                            }}
                        >
                            A profile picture helps personalize your hospital account.
                        </Typography>
                        <Box sx={{ position: 'relative', cursor: 'default', flexShrink: 0 }}>
                            <Avatar
                                sx={{
                                    width: 60,
                                    height: 60,
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    fontFamily: "'Outfit', sans-serif",
                                    background: 'linear-gradient(135deg, #006A6A 0%, #009688 100%)',
                                    boxShadow: '0 2px 10px rgba(0, 106, 106, 0.2)',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.04)',
                                    }
                                }}
                            >
                                {getInitials(initialData?.full_name)}
                            </Avatar>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                <Camera size={18} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Name Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Name
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: 'text.primary', 
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {initialData?.full_name || '-'}
                        </Typography>
                    </Box>

                    {/* Phone Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Phone
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: 'text.primary', 
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {initialData?.phone || 'Not Registered'}
                        </Typography>
                    </Box>

                    {/* Email Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Email
                        </Typography>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontWeight: 500, 
                                    color: 'text.primary', 
                                    fontFamily: "'DM Sans', sans-serif"
                                }}
                            >
                                {initialData?.email || '-'}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.disabled', 
                                    display: 'block', 
                                    fontSize: '11px', 
                                    mt: 0.5 
                                }}
                            >
                                Primary account email (cannot be modified)
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    {/* Full Name Input */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Full Name <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            name="full_name"
                            placeholder="e.g. John Smith"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <User size={18} style={{ opacity: 0.6 }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Phone Input */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Phone Number <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            name="phone"
                            placeholder="e.g. +92 300 1234567"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone size={18} style={{ opacity: 0.6 }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Email Input (Disabled) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'text.disabled',
                                fontFamily: "'Outfit', sans-serif"
                            }}
                        >
                            Email Address (Disabled)
                        </Typography>
                        <TextField
                            value={initialData?.email || ''}
                            disabled
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={18} style={{ opacity: 0.4 }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, pt: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                        <Button 
                            onClick={handleCancel} 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: '100px', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                borderColor: 'divider', 
                                color: 'text.primary',
                                px: 4,
                                py: 1.1,
                                fontSize: '14px',
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            type="submit"
                            isLoading={isLoading}
                            label="Save Changes"
                            fullWidth={false}
                            size="large"
                            sx={{ 
                                borderRadius: '100px',
                                px: 4,
                                py: 1.1,
                                fontSize: '14px',
                                alignSelf: { xs: 'stretch', sm: 'flex-start' }
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Card>
    );
};
