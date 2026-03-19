import { useMemo } from 'react';
import { TableRecord, SortState, SortOrder } from '../types';

export interface UseTableFilterOptions {
  data: TableRecord[];
  sortState: SortState;
  searchColumn: keyof TableRecord | 'all';
  searchText: string;
}

export interface UseTableFilterReturn {
  processed: TableRecord[];
  nextSortOrder: (col: keyof TableRecord, current: SortState) => SortState;
}

const SORTABLE: (keyof TableRecord)[] = ['name', 'date', 'amount', 'status'];

export function useTableFilter({
  data,
  sortState,
  searchColumn,
  searchText,
}: UseTableFilterOptions): UseTableFilterReturn {
  const processed = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(row =>
        searchColumn === 'all'
          ? Object.values(row).some(v => String(v).toLowerCase().includes(q))
          : String(row[searchColumn as keyof TableRecord]).toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortState.column && sortState.order) {
      const col = sortState.column;
      const dir = sortState.order === 'ascend' ? 1 : -1;
      result.sort((a, b) => {
        const av = a[col], bv = b[col];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    return result;
  }, [data, sortState, searchColumn, searchText]);

  const nextSortOrder = (col: keyof TableRecord, current: SortState): SortState => {
    if (!SORTABLE.includes(col)) return current;
    if (current.column !== col) return { column: col, order: 'ascend' };
    const next: SortOrder =
      current.order === 'ascend' ? 'descend' :
      current.order === 'descend' ? null : 'ascend';
    return { column: next ? col : null, order: next };
  };

  return { processed, nextSortOrder };
}

export { SORTABLE };
