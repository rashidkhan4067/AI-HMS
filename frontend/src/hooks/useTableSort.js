import { useState, useCallback } from 'react';

/**
 * Reusable table sort hook.
 * Replaces the duplicated orderBy/order/handleRequestSort/sortData
 * pattern found in AdminUsers, AdminAudits, AdminAppointments, etc.
 *
 * @param {string} defaultOrderBy — Initial column to sort by
 * @param {'asc'|'desc'} defaultOrder — Initial sort direction
 * @returns Sort state and handlers
 */
export const useTableSort = (defaultOrderBy, defaultOrder = 'asc') => {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [order, setOrder] = useState(defaultOrder);

  const handleRequestSort = useCallback(
    (property) => {
      setOrder((prev) => (orderBy === property && prev === 'asc' ? 'desc' : 'asc'));
      setOrderBy(property);
    },
    [orderBy]
  );

  /**
   * Sort an array of objects by the current orderBy/order.
   * @param {Array} data — Array to sort
   * @param {string[]} dateColumns — Column names that contain date values
   * @returns Sorted copy of the array
   */
  const sortData = useCallback(
    (data, dateColumns = []) => {
      return [...data].sort((a, b) => {
        let valA = a[orderBy] ?? '';
        let valB = b[orderBy] ?? '';

        if (dateColumns.includes(orderBy)) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (typeof valA === 'string') {
          return order === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return order === 'asc' ? valA - valB : valB - valA;
      });
    },
    [orderBy, order]
  );

  return { orderBy, order, handleRequestSort, sortData };
};
