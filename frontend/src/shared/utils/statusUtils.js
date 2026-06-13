import { 
    APPOINTMENT_STATUS, 
    BED_STATUS, 
    INVOICE_STATUS, 
    PAYMENT_METHOD_LABELS, 
    LICENSE_STATUS, 
    WARD_CATEGORY
} from '../constants';
import { COLORS } from '../theme.constants';

/**
 * Appointment Status Color Mapping
 */
export const getAppointmentStatusColor = (status) => {
    switch (status) {
        case APPOINTMENT_STATUS.SCHEDULED: return 'primary';
        case APPOINTMENT_STATUS.CHECKED_IN: return 'info';
        case APPOINTMENT_STATUS.IN_PROGRESS: return 'warning';
        case APPOINTMENT_STATUS.COMPLETED: return 'success';
        case APPOINTMENT_STATUS.CANCELLED: return 'error';
        case APPOINTMENT_STATUS.NO_SHOW: return 'default';
        default: return 'default';
    }
};

/**
 * Bed Status Color Mapping
 */
export const getBedStatusColor = (status) => {
    switch (status) {
        case BED_STATUS.AVAILABLE: return 'success';
        case BED_STATUS.OCCUPIED: return 'error';
        case BED_STATUS.MAINTENANCE: return 'warning';
        case BED_STATUS.RESERVED: return 'info';
        default: return 'default';
    }
};

/**
 * Application Status Color Mapping
 */
export const getApplicationStatusColor = (status) => {
    switch (status) {
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'error';
        case 'PENDING': return 'warning';
        default: return 'default';
    }
};

/**
 * Invoice Status Color Mapping
 */
export const getInvoiceStatusColor = (status) => {
    switch (status) {
        case INVOICE_STATUS.PAID: return 'success';
        case INVOICE_STATUS.PARTIAL: return 'warning';
        case INVOICE_STATUS.PENDING: return 'info';
        case INVOICE_STATUS.OVERDUE: return 'error';
        case INVOICE_STATUS.CANCELLED: return 'default';
        default: return 'default';
    }
};

/**
 * License Status Color Mapping
 */
export const getLicenseStatusColor = (status) => {
    switch (status) {
        case LICENSE_STATUS.VALID: return 'success';
        case LICENSE_STATUS.EXPIRING_SOON: return 'warning';
        case LICENSE_STATUS.EXPIRED: return 'error';
        default: return 'default';
    }
};

/**
 * Formats enum values into human-readable labels (e.g. IN_PROGRESS -> In Progress)
 */
export const formatEnumLabel = (enumValue) => {
    if (!enumValue) return '';
    return enumValue.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

/**
 * Retrieves human-readable label for payment methods
 */
export const getPaymentMethodLabel = (method) => {
    return PAYMENT_METHOD_LABELS[method] || formatEnumLabel(method);
};
