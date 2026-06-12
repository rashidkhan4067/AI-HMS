import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, InputAdornment, IconButton, Alert } from '@mui/material';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { LoadingButton } from '../../../shared/components/ui';
import { useAuth } from '../hooks/useAuth';

/**
 * ChangePassword — Security Settings card for updating user credentials.
 * Implements Google Account / Material 3 style card container and custom fields
 * with separate typography labels to prevent notch clipping.
 */
export const ChangePassword = () => {
    const { changePassword, error } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Shared toggle for all 3 fields
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [localError, setLocalError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleToggleShow = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setSuccess(false);

        if (formData.new_password !== formData.confirm_password) {
            setLocalError('New passwords do not match.');
            return;
        }

        setIsLoading(true);
        const isSuccess = await changePassword({
            old_password: formData.old_password,
            new_password: formData.new_password,
        });
        setIsLoading(false);

        if (isSuccess) {
            setSuccess(true);
            setFormData({ old_password: '', new_password: '', confirm_password: '' });
        }
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
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 700, 
                        fontFamily: "'Outfit', sans-serif", 
                        fontSize: '18px',
                        color: 'text.primary'
                    }}
                >
                    Security Settings
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
                    Update your password periodically to keep your hospital account secure.
                </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                {(localError || error) && (
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="error" sx={{ borderRadius: '12px' }}>
                            {localError || error?.detail || error?.message || 'Failed to update password. Please check your credentials.'}
                        </Alert>
                    </Box>
                )}

                {success && (
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="success" sx={{ borderRadius: '12px' }}>
                            Password successfully changed!
                        </Alert>
                    </Box>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Current Password Field */}
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
                            Current Password <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            name="old_password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.old_password}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={18} style={{ opacity: 0.6 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={handleToggleShow} 
                                            edge="end" 
                                            aria-label="toggle password visibility"
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* New Password Field */}
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
                            New Password <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            name="new_password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={18} style={{ opacity: 0.6 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={handleToggleShow} 
                                            edge="end" 
                                            aria-label="toggle password visibility"
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Confirm New Password Field */}
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
                            Confirm New Password <span style={{ color: '#F87171' }}>*</span>
                        </Typography>
                        <TextField
                            name="confirm_password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={18} style={{ opacity: 0.6 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={handleToggleShow} 
                                            edge="end" 
                                            aria-label="toggle password visibility"
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <LoadingButton
                        type="submit"
                        isLoading={isLoading}
                        label="Update Password"
                        fullWidth={false}
                        size="large"
                        sx={{ 
                            borderRadius: '100px',
                            px: 4,
                            py: 1.1,
                            fontSize: '14px',
                            alignSelf: { xs: 'stretch', sm: 'flex-start' },
                            mt: 1
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};
