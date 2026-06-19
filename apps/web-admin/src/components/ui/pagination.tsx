'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}: PaginationProps) {
  const start = total ? (currentPage - 1) * (pageSize || 10) + 1 : 0;
  const end = total ? Math.min(currentPage * (pageSize || 10), total) : 0;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        {total !== undefined && (
          <p className="text-sm text-zinc-400">
            Showing <span className="font-medium text-zinc-200">{start}</span> to <span className="font-medium text-zinc-200">{end}</span> of{' '}
            <span className="font-medium text-zinc-200">{total}</span> results
          </p>
        )}
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10">
              1
            </Button>
            {startPage > 2 && (
              <span className="px-1 text-sm text-zinc-600">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 p-0 ${
              page === currentPage
                ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
            }`}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-sm text-zinc-600">...</span>
            )}
            <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10">
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;