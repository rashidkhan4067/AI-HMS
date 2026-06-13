import { useState, useCallback } from 'react';

/**
 * Reusable dialog state management hook.
 * Replaces the repeated open/close/selectedItem pattern used in all 15 dialogs.
 *
 * @param {any} initialData - Default data when closed
 * @returns Dialog state and handlers
 */
export const useDialogState = (initialData = null) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const openDialog = useCallback((item = null) => {
    setData(item);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setTimeout(() => setData(initialData), 200); // Clear data after exit animation
  }, [initialData]);

  return { open, data, openDialog, closeDialog };
};
