import { useState } from 'react';
import { Box } from '@mui/material';
import { PasswordField, LoadingButton, FormCard } from '../../../shared/components/ui';
import { useAuth } from '../hooks/useAuth';

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
        // FormCard handles Card + CardContent + title + error/success alerts
        <FormCard
            title="Security Settings"
            titleColor="error"
            error={localError || error}
            success={success ? 'Password successfully changed!' : null}
            sx={{ mt: 3 }}
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* All 3 fields share one visibility toggle (sharedShow + onToggleShow) */}
                <PasswordField
                    label="Current Password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    sharedShow={showPassword}
                    onToggleShow={handleToggleShow}
                />

                <PasswordField
                    label="New Password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    sharedShow={showPassword}
                    onToggleShow={handleToggleShow}
                />

                <PasswordField
                    label="Confirm New Password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    sharedShow={showPassword}
                    onToggleShow={handleToggleShow}
                />

                <LoadingButton
                    isLoading={isLoading}
                    label="Update Password"
                    fullWidth={false}
                    size="large"
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                />
            </Box>
        </FormCard>
    );
};
