import { Stethoscope, Calendar, Pill, ShieldCheck, Users, ClipboardList } from 'lucide-react';

/**
 * Al Shifaa HMS — Role Definitions
 * Includes label, icon, description, and post-login redirect path.
 */
export const ROLES = [
    {
        key:         'ADMIN',
        label:       'Administrator',
        description: 'Provision users, manage configs, and audit system access.',
        icon:        ShieldCheck,
        color:       '#7D5700',          // Warning teal-amber
        redirect:    '/admin',
    },
    {
        key:         'DOCTOR',
        label:       'Doctor / Clinician',
        description: 'Access EHR charts, write clinical notes, and manage patients.',
        icon:        Stethoscope,
        color:       '#006A6A',          // Primary teal
        redirect:    '/dashboard',
    },
    {
        key:         'NURSE',
        label:       'Clinical Nurse',
        description: 'Log vitals, triage patients, and update care plans.',
        icon:        ClipboardList,
        color:       '#1D6B35',          // Success green
        redirect:    '/dashboard',
    },
    {
        key:         'RECEPTIONIST',
        label:       'Receptionist',
        description: 'Schedule appointments and manage patient check-ins.',
        icon:        Calendar,
        color:       '#4A6363',          // Secondary teal-grey
        redirect:    '/dashboard',
    },
    {
        key:         'PHARMACIST',
        label:       'Pharmacist',
        description: 'Manage prescriptions, dispensing, and drug inventory.',
        icon:        Pill,
        color:       '#006A6A',
        redirect:    '/dashboard',
    },
    {
        key:         'PATIENT',
        label:       'Patient',
        description: 'Book appointments, view records, and message your care team.',
        icon:        Users,
        color:       '#4A6363',
        redirect:    '/dashboard',
    },
];

/** Map role key → redirect path */
export const ROLE_REDIRECTS = Object.fromEntries(
    ROLES.map((r) => [r.key, r.redirect])
);

/** Login dropdown roles (subset shown to the user at login) */
export const LOGIN_ROLES = [
    { value: 'ADMIN',        label: 'Administrator' },
    { value: 'DOCTOR',       label: 'Doctor / Clinician' },
    { value: 'NURSE',        label: 'Nurse' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'PHARMACIST',   label: 'Pharmacist' },
    { value: 'PATIENT',      label: 'Patient' },
];
