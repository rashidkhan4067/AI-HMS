import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

/**
 * PasswordField — Reusable password input with built-in floating label.
 * Styled after Google Identity standards with responsive visibility toggles.
 *
 * @param {string}   label       - Field label text
 * @param {string}   name        - Input name attribute (for form handling)
 * @param {string}   value       - Controlled value
 * @param {function} onChange    - onChange handler
 * @param {string}   placeholder - Placeholder text (per UI Standards: required)
 * @param {boolean}  required    - HTML required attribute
 * @param {boolean}  sharedShow  - Optional: externally controlled visibility state
 * @param {function} onToggleShow - Optional: external toggle handler
 * @param {object}   sx          - Additional MUI sx styles
 */
export const PasswordField = ({
    label = 'Password',
    name = 'password',
    value,
    onChange,
    placeholder = 'Enter your password',
    required = false,
    sharedShow,       
    onToggleShow,     
    sx = {},
    error,
    helperText,
    ...rest
}) => {
    // Internal state used only if no external toggle is provided
    const [internalShow, setInternalShow] = useState(false);

    const showPassword = sharedShow !== undefined ? sharedShow : internalShow;
    const handleToggle = onToggleShow
        ? onToggleShow
        : () => setInternalShow((prev) => !prev);

    return (
        <TextField
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            label={label}
            variant="outlined"
            fullWidth
            error={error}
            helperText={helperText}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 0.5 }} />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton 
                            onClick={handleToggle} 
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
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{
                '& .MuiInputLabel-root': {
                    fontFamily: 'Outfit, sans-serif',
                },
                '& .MuiOutlinedInput-root': {
                    '& .MuiOutlinedInput-input': {
                        fontFamily: 'Outfit, sans-serif',
                    }
                },
                ...sx,
            }}
            {...rest}
        />
    );
};
