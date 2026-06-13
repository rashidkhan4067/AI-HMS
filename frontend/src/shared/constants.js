/**
 * Al Shifaa HMS — Shared Constants
 * Centralized route paths, API endpoints, pagination defaults, and status constants.
 * No hardcoded strings elsewhere in the codebase.
 */

// ─── Route Paths ───────────────────────────────────────────────
export const ROUTES = {
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_INVITES: '/admin/invites',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_AUDITS: '/admin/audits',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_COMPLIANCE: '/admin/compliance',
  ADMIN_REVENUE: '/admin/revenue',
  ADMIN_IPD: '/admin/ipd',
  ADMIN_ROSTER: '/admin/roster',
  ADMIN_APPOINTMENTS: '/admin/appointments',

  // Role dashboards
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  NURSE_DASHBOARD: '/nurse/dashboard',
  RECEPTIONIST_DASHBOARD: '/receptionist/dashboard',
  PHARMACIST_DASHBOARD: '/pharmacist/dashboard',
  LAB_DASHBOARD: '/lab/dashboard',
  RADIOLOGY_DASHBOARD: '/radiology/dashboard',
  PATIENT_DASHBOARD: '/patient/dashboard',

  // Auth
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/forbidden',
  UNAUTHORIZED: '/unauthorized',
  PRIVACY: '/privacy',
  TERMS: '/terms',
};

/** Maps backend role keys to their post-login redirect route */
export const ROLE_REDIRECT_MAP = {
  ADMIN: ROUTES.ADMIN_DASHBOARD,
  DOCTOR: ROUTES.DOCTOR_DASHBOARD,
  NURSE: ROUTES.NURSE_DASHBOARD,
  RECEPTIONIST: ROUTES.RECEPTIONIST_DASHBOARD,
  PHARMACIST: ROUTES.PHARMACIST_DASHBOARD,
  LAB_TECHNICIAN: ROUTES.LAB_DASHBOARD,
  RADIOLOGIST: ROUTES.RADIOLOGY_DASHBOARD,
  PATIENT: ROUTES.PATIENT_DASHBOARD,
};

// ─── API Endpoints ─────────────────────────────────────────────
export const API = {
  // Admin
  ADMIN_DASHBOARD_DATA: 'auth/admin/dashboard-data/',
  ADMIN_OVERVIEW: 'auth/admin/overview/',
  ADMIN_USERS: 'auth/admin/users/',
  ADMIN_AUDITS: 'auth/admin/audits/',
  ADMIN_HEALTH_CHECK: 'auth/admin/health-check/',
  ADMIN_COMPLIANCE_PMDC: 'auth/admin/compliance/pmdc/',
  ADMIN_BILLING_RECONCILE: 'auth/admin/billing/reconcile/',
  ADMIN_BILLING_OVERSIGHT: 'auth/admin/billing/oversight/',
  ADMIN_DEPARTMENTS: 'auth/admin/departments/',

  // Departments (public)
  DEPARTMENTS_PUBLIC: 'auth/departments/',

  // Doctors
  DOCTORS: 'auth/doctors/',

  // IPD
  IPD_WARDS: 'auth/ipd/wards/',
  IPD_BEDS: 'auth/ipd/beds/',
  IPD_ADMISSIONS: 'auth/ipd/admissions/',

  // Rosters
  ROSTERS: 'auth/rosters/',

  // Appointments
  APPOINTMENTS: 'auth/appointments/',

  // Invitations
  INVITATIONS: 'auth/invitations/',

  // Applications
  APPLICATIONS: 'auth/doctor-applications/',
};

// ─── Pagination Defaults ───────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_ROWS_PER_PAGE: 10,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25],
};

// ─── Role Keys ─────────────────────────────────────────────────
export const ROLE_KEYS = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RADIOLOGIST: 'RADIOLOGIST',
  PATIENT: 'PATIENT',
};

/** All valid clinical/staff roles (excludes PATIENT) */
export const STAFF_ROLES = [
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.DOCTOR,
  ROLE_KEYS.NURSE,
  ROLE_KEYS.RECEPTIONIST,
  ROLE_KEYS.PHARMACIST,
  ROLE_KEYS.LAB_TECHNICIAN,
  ROLE_KEYS.RADIOLOGIST,
];

/** All valid backend roles */
export const ALL_ROLES = [...STAFF_ROLES, ROLE_KEYS.PATIENT];

// ─── Appointment Statuses ──────────────────────────────────────
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// ─── Bed Statuses ──────────────────────────────────────────────
export const BED_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
};

// ─── Ward Categories ───────────────────────────────────────────
export const WARD_CATEGORY = {
  GENERAL: 'GENERAL',
  PRIVATE: 'PRIVATE',
  ICU: 'ICU',
  NICU: 'NICU',
  EMERGENCY: 'EMERGENCY',
  MATERNITY: 'MATERNITY',
};

// ─── Payment Methods ───────────────────────────────────────────
export const PAYMENT_METHOD = {
  CASH: 'CASH',
  CARD: 'CARD',
  MOBILE_PAY: 'MOBILE_PAY',
  INSURANCE: 'INSURANCE',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: 'Cash Payments',
  [PAYMENT_METHOD.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHOD.MOBILE_PAY]: 'Digital Online Transfer',
  [PAYMENT_METHOD.INSURANCE]: 'Insurance Claims',
};

// ─── Invoice Statuses ──────────────────────────────────────────
export const INVOICE_STATUS = {
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
};

// ─── Login Methods ─────────────────────────────────────────────
export const LOGIN_METHOD = {
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
};

// ─── Compliance ────────────────────────────────────────────────
export const LICENSE_STATUS = {
  VALID: 'VALID',
  EXPIRED: 'EXPIRED',
  EXPIRING_SOON: 'EXPIRING_SOON',
};

export const LICENSE_EXPIRY_WARNING_DAYS = 60;

// ─── Misc ──────────────────────────────────────────────────────
export const INVITE_VALIDITY_DAYS = 7;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
export const LOCAL_STORAGE_KEYS = {
  ADMIN_CACHE: 'alshifaa_admin_cache',
};
