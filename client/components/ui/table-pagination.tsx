import React from 'react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  /** Zero-based current page index */
  pageIndex: number;
  /** Total number of pages */
  pageCount: number;
  /** Total number of rows across all pages */
  totalCount?: number;
  /** Label for the counted items, e.g. "students" or "members" */
  itemLabel?: string;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

/**
 * Reusable Previous / Next pagination bar for tables.
 *
 * Usage:
 *   <TablePagination
 *     pageIndex={pageIndex}
 *     pageCount={pageCount}
 *     totalCount={filteredUsers.length}
 *     itemLabel="students"
 *     canPreviousPage={canPreviousPage}
 *     canNextPage={canNextPage}
 *     onPreviousPage={() => setPageIndex((p) => p - 1)}
 *     onNextPage={() => setPageIndex((p) => p + 1)}
 *   />
 */
export const TablePagination: React.FC<TablePaginationProps> = ({
  pageIndex,
  pageCount,
  totalCount,
  itemLabel = 'items',
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <div className="flex justify-between py-4">
      <span className="text-xs text-slate-400 mx-2">
        Page {pageIndex + 1} of {pageCount}
        {totalCount !== undefined && (
          <>
            {' '}· {totalCount} {itemLabel}
          </>
        )}
      </span>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
