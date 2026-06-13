import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TablePagination,
  TableSortLabel,
  useTheme,
  Box,
} from '@mui/material';
import { RADII, FONTS } from '../../theme.constants';

/**
 * Universal Data Table
 * Handles sorting, pagination, empty states, and row clicks.
 * 
 * @param {Array} columns - Array of { id, label, align, sortable, render }
 * @param {Array} data - Array of row objects
 * @param {Object} sortState - { orderBy, order, handleRequestSort } from useTableSort hook
 * @param {Object} paginationState - { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, rowsPerPageOptions } from usePagination hook
 * @param {Function} onRowClick - Optional row click handler
 * @param {React.ReactNode} emptyMessage - Content to show when data is empty
 */
export const DataTable = ({
  columns,
  data,
  sortState,
  paginationState,
  onRowClick,
  emptyMessage = 'No records found.',
}) => {
  const theme = useTheme();

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: RADII.MEDIUM,
          overflowX: 'auto',
        }}
      >
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    py: 1.5,
                    fontFamily: FONTS.HEADING,
                  }}
                >
                  {col.sortable && sortState ? (
                    <TableSortLabel
                      active={sortState.orderBy === col.id}
                      direction={sortState.orderBy === col.id ? sortState.order : 'asc'}
                      onClick={() => sortState.handleRequestSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary', fontFamily: FONTS.BODY }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={`${row.id || index}-${col.id}`}
                      align={col.align || 'left'}
                      sx={{ fontFamily: FONTS.BODY }}
                    >
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {paginationState && data.length > 0 && (
        <TablePagination
          rowsPerPageOptions={paginationState.rowsPerPageOptions || [5, 10, 25]}
          component="div"
          count={paginationState.count !== undefined ? paginationState.count : -1}
          rowsPerPage={paginationState.rowsPerPage}
          page={paginationState.page}
          onPageChange={paginationState.handleChangePage}
          onRowsPerPageChange={paginationState.handleChangeRowsPerPage}
          sx={{ borderTop: 'none', mt: 1 }}
          labelDisplayedRows={({ from, to, count }) => 
            count !== -1 ? `${from}–${to} of ${count}` : `${from}–${to} of more`
          }
        />
      )}
    </>
  );
};
