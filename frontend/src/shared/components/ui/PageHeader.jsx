import { Box, Typography } from '@mui/material';

/**
 * PageHeader — Consistent page title + optional subtitle block.
 *
 * Extracted from: ProfilePage (h4 + body1 subtitle pattern)
 * Will be reused by: PatientListPage, DoctorProfilePage, AppointmentPage, etc.
 * Location: shared/components/ui/ per component-standards.md (Category 1: UI Components)
 *
 * @param {string}    title       - Main page title (h4 by default)
 * @param {string}    subtitle    - Secondary description text below the title
 * @param {string}    titleColor  - MUI color for the title (default: 'primary')
 * @param {object}    sx          - Additional MUI sx styles on the wrapper Box
 */
export const PageHeader = ({
    title,
    subtitle,
    titleColor = 'primary',
    sx = {},
}) => {
    return (
        <Box sx={{ mb: 4, ...sx }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color={titleColor}
            >
                {title}
            </Typography>

            {subtitle && (
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};
