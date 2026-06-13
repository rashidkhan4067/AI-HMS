import React from 'react';
import { Chip } from '@mui/material';

/**
 * StatusChip — Color-coded chip displaying appointment or onboarding invitation statuses.
 *
 * Used in: PatientDashboard, DoctorDashboard, AdminInvitations, InviteDetailsDialog
 * Location: shared/components/ui/
 *
 * @param {string} status   - Status value (e.g., 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED' or 'REGISTERED', 'EXPIRED')
 * @param {string} type     - One of: 'appointment' | 'invitation' (default: 'appointment')
 * @param {object} invite   - Optional invitation object to dynamically resolve invitation status
 * @param {string} size     - MUI Chip size: 'small' | 'medium' (default: 'small')
 * @param {boolean} uppercase - Force label text to be uppercase (default: false)
 * @param {object} sx       - Additional MUI sx styling overrides
 */
export const StatusChip = ({ status, type = 'appointment', invite = null, size = 'small', uppercase = false, sx = {} }) => {
    let resolvedStatus = status;
    let resolvedType = type;

    if (invite) {
        resolvedType = 'invitation';
        if (invite.is_used) resolvedStatus = 'REGISTERED';
        else if (invite.is_expired) resolvedStatus = 'EXPIRED';
        else resolvedStatus = 'PENDING';
    }

    if (resolvedType === 'appointment') {
        const config = {
            PENDING: { label: 'Pending', bg: 'rgba(13, 110, 253, 0.06)', border: 'rgba(13, 110, 253, 0.15)', text: '#0D6EFD' },
            CONFIRMED: { label: 'Confirmed', bg: 'rgba(0, 106, 106, 0.06)', border: 'rgba(0, 106, 106, 0.15)', text: '#006A6A' },
            CANCELLED: { label: 'Cancelled', bg: 'rgba(186, 26, 26, 0.06)', border: 'rgba(186, 26, 26, 0.15)', text: '#BA1A1A' },
            COMPLETED: { label: 'Completed', bg: 'rgba(22, 163, 74, 0.06)', border: 'rgba(22, 163, 74, 0.15)', text: '#16A34A' }
        };

        const cfg = config[resolvedStatus?.toUpperCase()] || { label: resolvedStatus, bg: 'rgba(107, 114, 128, 0.06)', border: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' };
        const label = uppercase ? cfg.label.toUpperCase() : cfg.label;

        return (
            <Chip 
                label={label}
                size={size}
                sx={{
                    bgcolor: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.text,
                    fontWeight: 600,
                    fontSize: size === 'small' ? '11.5px' : '13px',
                    height: size === 'small' ? '22px' : '32px',
                    ...sx
                }}
            />
        );
    } else if (resolvedType === 'invitation') {
        const config = {
            REGISTERED: { label: 'Registered', color: 'success' },
            EXPIRED: { label: 'Expired', color: 'default' },
            PENDING: { label: 'Pending', color: 'warning' }
        };

        const cfg = config[resolvedStatus?.toUpperCase()] || { label: resolvedStatus, color: 'default' };
        const label = uppercase ? cfg.label.toUpperCase() : cfg.label;

        return (
            <Chip 
                label={label} 
                size={size} 
                color={cfg.color}
                sx={{ 
                    fontWeight: 600, 
                    ...sx 
                }} 
            />
        );
    }
    
    return null;
};

export default StatusChip;
