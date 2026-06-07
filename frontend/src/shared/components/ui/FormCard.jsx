import { Card, CardContent, Typography, Alert } from '@mui/material';

/**
 * FormCard — A card wrapper with a title and optional error/success alerts.
 *
 * Extracted from: ProfileForm, ChangePassword (same Card+CardContent+Typography+Alert pattern)
 * Location: shared/components/ui/ per component-standards.md (Category 1: UI Components)
 *
 * @param {string}    title       - Card section title (h6)
 * @param {string}    titleColor  - MUI color for the title (default: 'text.primary')
 * @param {string}    error       - Error message — rendered as <Alert severity="error">
 * @param {string}    success     - Success message — rendered as <Alert severity="success">
 * @param {ReactNode} children    - Form content to render inside the card
 * @param {object}    sx          - Additional MUI sx styles on the Card root
 */
export const FormCard = ({
    title,
    titleColor = 'text.primary',
    error,
    success,
    children,
    sx = {},
}) => {
    return (
        <Card sx={{ ...sx }}>
            <CardContent>
                {title && (
                    <Typography 
                        variant="h6" 
                        gutterBottom 
                        color={titleColor}
                        sx={{ fontWeight: 600 }}
                    >
                        {title}
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {children}
            </CardContent>
        </Card>
    );
};
