import { useState, useMemo, useEffect } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  canPrev: boolean;
  canNext: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  pageNumbers: number[];
}

export function usePagination({ totalItems, pageSize: initialPageSize = 10 }: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 whenever data count or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex   = Math.min(startIndex + pageSize, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
  };

  const nextPage = () => canNext && setCurrentPage(p => p + 1);
  const prevPage = () => canPrev && setCurrentPage(p => p - 1);

  const setPageSize = (size: number) => setPageSizeState(size);

  // Build visible page numbers (max 5 shown, with ellipsis handled by consumer)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const left  = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    const pages: number[] = [1];
    if (left > 2) pages.push(-1); 
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push(-1);
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  return {
    currentPage, pageSize, totalPages,
    startIndex, endIndex,
    canPrev, canNext,
    goToPage, nextPage, prevPage,
    setPageSize,
    pageNumbers,
  };
}
