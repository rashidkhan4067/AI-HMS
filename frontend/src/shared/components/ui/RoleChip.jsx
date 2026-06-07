import { Chip } from '@mui/material';

/**
 * RoleChip — Color-coded badge displaying a user's RBAC role.
 *
 * Used in: ProfilePage (profile header), future Admin user tables, Doctor dashboards
 * Location: shared/components/ui/ per component-standards.md (Category 1: UI Components)
 *
 * Role → Color mapping follows the M3 design system semantic colors:
 *   ADMIN       → error   (red — highest privilege, draws attention)
 *   DOCTOR      → primary (blue — clinical authority)
 *   RECEPTIONIST→ warning (amber — operational, front-desk)
 *   PATIENT     → success (green — safe, non-privileged)
 *
 * @param {string} role  - One of: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT'
 * @param {string} size  - MUI Chip size: 'small' | 'medium' (default: 'small')
 * @param {object} sx    - Additional MUI sx styles
 */

const ROLE_COLOR_MAP = {
    ADMIN:        'error',
    DOCTOR:       'primary',
    RECEPTIONIST: 'warning',
    PATIENT:      'success',
};

const ROLE_LABEL_MAP = {
    ADMIN:        'Admin',
    DOCTOR:       'Doctor',
    RECEPTIONIST: 'Receptionist',
    PATIENT:      'Patient',
};

export const RoleChip = ({ role, size = 'small', sx = {} }) => {
    const color = ROLE_COLOR_MAP[role] || 'default';
    const label = ROLE_LABEL_MAP[role] || role;

    return (
        <Chip
            label={label}
            color={color}
            size={size}
            variant="filled"
            sx={{ 
                fontWeight: 600, 
                ...sx 
            }}
        />
    );
};
