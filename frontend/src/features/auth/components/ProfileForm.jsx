import { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { FormCard, LoadingButton } from '../../../shared/components/ui';

export const ProfileForm = ({ initialData, onSave, isLoading, error, success }) => {
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        email:      initialData?.email      || '',
    });

    const [prevInitialData, setPrevInitialData] = useState(initialData);

    // Sync form when parent loads fresh profile data without using useEffect
    if (initialData !== prevInitialData) {
        setFormData({
            full_name: initialData?.full_name || '',
            email:      initialData?.email      || '',
        });
        setPrevInitialData(initialData);
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <FormCard title="Personal Information" error={error} success={success}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                    label="Full Name"
                    name="full_name"
                    placeholder="e.g. John Smith"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                />

                <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="e.g. john.smith@hospital.com"
                    value={formData.email}
                    disabled
                    fullWidth
                    variant="outlined"
                />

                <LoadingButton
                    isLoading={isLoading}
                    label="Save Changes"
                    fullWidth={false}
                    size="large"
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                />
            </Box>
        </FormCard>
    );
};
