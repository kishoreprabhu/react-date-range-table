import React, { useEffect } from 'react';
import { ConfigProvider, Typography, Divider } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateRangePicker } from './components/DateRangePicker';
import { DataTable } from './components/DataTable';
import { useAppStore, TIMEZONES } from './store/useAppStore';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const App: React.FC = () => {
  // Use individual selectors so each value subscribes independently
  // and the component re-renders when any of them change
  const timezone  = useAppStore(s => s.timezone);
  const startDate = useAppStore(s => s.startDate);
  const endDate   = useAppStore(s => s.endDate);
  const fetchData = useAppStore(s => s.fetchData);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const tzLabel = TIMEZONES.find(t => t.value === timezone)?.label ?? timezone;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#232f3e', borderRadius: 8 } }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-dark px-6 py-5 shadow-lg shadow-blue-300/30">
          <div className="max-w-[1200px] mx-auto">
            <Title level={4} className="!text-white !mb-0">Transaction Dashboard</Title>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-[1200px] mx-auto px-6 py-7 pt-24">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <span className="block text-[13px] text-gray-400 mb-1.5">Date Range</span>
              <DateRangePicker />
            </div>
            {startDate && endDate && (
              <div className="flex flex-col gap-0.5 px-3.5 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-primary font-semibold">
                  {endDate.diff(startDate, 'day') + 1} days
                </span>
                <span className="text-gray-400 text-xs">selected</span>
              </div>
            )}
          </div>

          <Divider className="!my-5" />

          <Title level={5} className="!mb-4 !text-gray-800">Transaction Records</Title>
          <DataTable />
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
