import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TableRecord, SortState } from '../types';
import { fetchTableData } from '../data/mockApi';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONES = [
  { label: 'UTC (GMT+0)',                       value: 'UTC',                  offset: 'GMT+0'    },
  { label: 'Asia/Kolkata — IST (GMT+5:30)',     value: 'Asia/Kolkata',         offset: 'GMT+5:30' },
  { label: 'Asia/Dubai — GST (GMT+4)',          value: 'Asia/Dubai',           offset: 'GMT+4'    },
  { label: 'Asia/Tokyo — JST (GMT+9)',          value: 'Asia/Tokyo',           offset: 'GMT+9'    },
  { label: 'Europe/Moscow — MSK (GMT+3)',       value: 'Europe/Moscow',        offset: 'GMT+3'    },
  { label: 'Europe/London — GMT (GMT+0)',       value: 'Europe/London',        offset: 'GMT+0'    },
  { label: 'America/New_York — EST (GMT-5)',    value: 'America/New_York',     offset: 'GMT-5'    },
  { label: 'America/Los_Angeles — PST (GMT-8)', value: 'America/Los_Angeles',  offset: 'GMT-8'    },
  { label: 'Australia/Sydney — AEDT (GMT+11)', value: 'Australia/Sydney',     offset: 'GMT+11'   },
  { label: 'Pacific/Auckland — NZDT (GMT+13)', value: 'Pacific/Auckland',     offset: 'GMT+13'   },
];

export const MAX_DAYS = 10;
export const MAX_PAST_DAYS = 90;

interface AppState {
  timezone: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;

  tableData: TableRecord[];
  loading: boolean;
  sortState: SortState;
  searchColumn: keyof TableRecord | 'all';
  searchText: string;

  setTimezone: (tz: string) => void;
  setDateRange: (start: Dayjs | null, end: Dayjs | null) => void;
  setSortState: (sort: SortState) => void;
  setSearch: (column: keyof TableRecord | 'all', text: string) => void;
  fetchData: () => Promise<void>;
}

export function formatDateWithTz(date: Dayjs, tz: string, isEnd: boolean): string {
  const d = date.tz(tz);
  const time = isEnd ? '23:59:59' : '00:00:00';
  const offset = d.format('Z');
  return `${d.format('YYYY-MM-DD')} ${time} ${offset}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  timezone: 'Asia/Kolkata',
  // Initialise dates already converted in the default timezone
  startDate: dayjs().subtract(6, 'day'),
  endDate: dayjs(),

  tableData: [],
  loading: false,
  sortState: { column: null, order: null },
  searchColumn: 'all',
  searchText: '',

  // Set timezone first, then re-fetch so table data reflects the new tz offset
  setTimezone: async (tz: string) => {
    console.log(tz, "tz")
    set({ timezone: tz });
    
    await get().fetchData();
  },

  setDateRange: (start, end) => set({ startDate: start, endDate: end }),
  setSortState: (sort) => set({ sortState: sort }),
  setSearch: (column, text) => set({ searchColumn: column, searchText: text }),

  fetchData: async () => {
    const { startDate, endDate, timezone } = get();
    if (!startDate || !endDate) return;
    set({ loading: true });
    try {
      const data = await fetchTableData({
        startDate: formatDateWithTz(startDate, timezone, false),
        endDate:   formatDateWithTz(endDate,   timezone, true),
        timezone,
      });
      set({ tableData: data });
    } finally {
      set({ loading: false });
    }
  },
}));
