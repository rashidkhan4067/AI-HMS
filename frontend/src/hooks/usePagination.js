import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../shared/constants';

/**
 * Reusable pagination hook.
 * Replaces the duplicated page/rowsPerPage/handleChangePage/handleChangeRowsPerPage
 * pattern found in every admin table page.
 *
 * @param {number} defaultRowsPerPage — Initial rows per page
 * @returns Pagination state and handlers
 */
export const usePagination = (defaultRowsPerPage = PAGINATION.DEFAULT_ROWS_PER_PAGE) => {
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  const resetPage = useCallback(() => {
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  /** Slice a data array to the current page window */
  const paginate = useCallback(
    (data) => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage]
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
    paginate,
    rowsPerPageOptions: PAGINATION.ROWS_PER_PAGE_OPTIONS,
  };
};
