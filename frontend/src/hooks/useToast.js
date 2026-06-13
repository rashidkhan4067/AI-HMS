import { useState, useCallback } from 'react';

/**
 * Reusable toast notification hook.
 * Replaces the { open, message, severity } pattern duplicated across pages.
 *
 * @returns Toast state and handlers
 */
export const useToast = () => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return { toast, showToast, hideToast };
};
