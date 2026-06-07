import { Button, CircularProgress } from '@mui/material';

/**
 * LoadingButton — A submit button that shows a spinner when isLoading=true.
 *
 * Extracted from: LoginForm, RegisterForm, ProfileForm, ChangePassword (4 instances)
 * Location: shared/components/ui/ per component-standards.md (Category 1: UI Components)
 *
 * @param {boolean}   isLoading  - When true, replaces label with a CircularProgress spinner
 * @param {string}    label      - Button text when not loading
 * @param {string}    color      - MUI color token (default: 'primary')
 * @param {string}    variant    - MUI variant (default: 'contained')
 * @param {string}    type       - Button type (default: 'submit')
 * @param {boolean}   fullWidth  - Span full container width (default: false)
 * @param {object}    sx         - Additional MUI sx styles
 */
export const LoadingButton = ({
    isLoading = false,
    label = 'Submit',
    color = 'primary',
    variant = 'contained',
    type = 'submit',
    fullWidth = false,
    size = 'medium',
    disabled = false,
    sx = {},
    ...rest
}) => {
    return (
        <Button
            type={type}
            variant={variant}
            color={color}
            fullWidth={fullWidth}
            size={size}
            disabled={isLoading || disabled}
            sx={{
                borderRadius: '100px',
                textTransform: 'none',
                fontWeight: 500,
                px: size === 'small' ? 2 : size === 'large' ? 4 : 3,
                ...sx
            }}
            {...rest}
        >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : label}
        </Button>
    );
};
