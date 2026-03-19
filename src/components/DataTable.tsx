import React from 'react';
import { Input, Select, Spin, Empty } from 'antd';
import {
  SearchOutlined, SwapOutlined,
  SortAscendingOutlined, SortDescendingOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store/useAppStore';
import { TableRecord } from '../types';
import { useTableFilter, SORTABLE } from '../hooks/useTableFilter';
import { usePagination } from '../hooks/usePagination';

const SEARCH_OPTIONS = [
  { label: 'All Columns', value: 'all'      },
  { label: 'Name',        value: 'name'     },
  { label: 'Date',        value: 'date'     },
  { label: 'Category',    value: 'category' },
  { label: 'Status',      value: 'status'   },
];

const PAGE_SIZE_OPTIONS = [
  { label: '5 / page',  value: 5  },
  { label: '10 / page', value: 10 },
  { label: '20 / page', value: 20 },
  { label: '50 / page', value: 50 },
];

const COL_LABELS: Record<keyof TableRecord, string> = {
  id: 'ID', name: 'Name', date: 'Date',
  amount: 'Amount', status: 'Status', category: 'Category',
};

const COLUMNS: (keyof TableRecord)[] = ['id', 'name', 'date', 'amount', 'status', 'category'];

const statusClass: Record<TableRecord['status'], string> = {
  Active:    'status-badge status-active',
  Pending:   'status-badge status-pending',
  Inactive:  'status-badge status-inactive',
  Completed: 'status-badge status-completed',
};

export const DataTable: React.FC = () => {
  const tableData    = useAppStore(s => s.tableData);
  const loading      = useAppStore(s => s.loading);
  const sortState    = useAppStore(s => s.sortState);
  const searchColumn = useAppStore(s => s.searchColumn);
  const searchText   = useAppStore(s => s.searchText);
  const setSortState = useAppStore(s => s.setSortState);
  const setSearch    = useAppStore(s => s.setSearch);

  const { processed, nextSortOrder } = useTableFilter({
    data: tableData,
    sortState,
    searchColumn,
    searchText,
  });

  const pagination = usePagination({ totalItems: processed.length, pageSize: 10 });
  const pageRows = processed.slice(pagination.startIndex, pagination.endIndex);

  const handleSort = (col: keyof TableRecord) => {
    setSortState(nextSortOrder(col, sortState));
  };

  const SortIcon = ({ col }: { col: keyof TableRecord }) => {
    if (!SORTABLE.includes(col)) return null;
    if (sortState.column !== col)
      return <SwapOutlined rotate={90} className="text-gray-300 text-[11px]" />;
    return sortState.order === 'ascend'
      ? <SortAscendingOutlined  className="text-primary text-[13px]" />
      : <SortDescendingOutlined className="text-primary text-[13px]" />;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <Select
          value={searchColumn}
          onChange={v => setSearch(v, searchText)}
          options={SEARCH_OPTIONS}
          className="w-40"
          data-testid="search-column-select"
        />
        <Input
          prefix={<SearchOutlined className="text-gray-300" />}
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearch(searchColumn, e.target.value)}
          className="w-60"
          allowClear
          data-testid="search-input"
        />
        <span className="ml-auto text-gray-400 text-[13px]" data-testid="record-count">
          {processed.length} record{processed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16" data-testid="loading-spinner">
          <Spin size="large" />
          <p className="mt-3 text-gray-400">Fetching data...</p>
        </div>
      ) : processed.length === 0 ? (
        <Empty description="No records found" className="py-10" data-testid="empty-state" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="data-table" data-testid="data-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className={`${SORTABLE.includes(col) ? 'sortable' : ''} ${sortState.column === col ? 'sorted' : ''}`}
                      data-testid={`th-${col}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {COL_LABELS[col]}
                        <SortIcon col={col} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <tr key={row.id} data-testid={`row-${row.id}`}>
                    <td>
                      <span className="font-mono text-gray-400 text-xs">{row.id}</span>
                    </td>
                    <td className="font-medium text-gray-800">{row.name}</td>
                    <td>{row.date}</td>
                    <td className="font-semibold text-green-600">${row.amount.toLocaleString()}</td>
                    <td>
                      <span className={statusClass[row.status]}>{row.status}</span>
                    </td>
                    <td>
                      <span className="category-pill">{row.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100"
            data-testid="pagination">
            {/* Page info + size */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-gray-400">
                {pagination.startIndex + 1}–{pagination.endIndex} of {processed.length}
              </span>
              <Select
                value={pagination.pageSize}
                onChange={pagination.setPageSize}
                options={PAGE_SIZE_OPTIONS}
                size="small"
                className="w-28"
                data-testid="page-size-select"
              />
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={pagination.prevPage}
                disabled={!pagination.canPrev}
                className="pagination-btn"
                data-testid="prev-page"
              >
                <LeftOutlined className="text-xs" />
              </button>

              {pagination.pageNumbers.map((num, i) =>
                num === -1 ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={num}
                    onClick={() => pagination.goToPage(num)}
                    className={`pagination-btn ${pagination.currentPage === num ? 'pagination-btn-active' : ''}`}
                    data-testid={`page-btn-${num}`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={pagination.nextPage}
                disabled={!pagination.canNext}
                className="pagination-btn"
                data-testid="next-page"
              >
                <RightOutlined className="text-xs" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
