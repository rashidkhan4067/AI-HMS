import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Reusable Toast Notification component.
 * Works with the `useToast` hook.
 * 
 * @param {Object} toast - { open, message, severity } from useToast
 * @param {Function} onClose - hideToast from useToast
 */
export const ToastNotification = ({ toast, onClose }) => {
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={toast.severity} sx={{ width: '100%', fontFamily: "'DM Sans', sans-serif" }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
};
