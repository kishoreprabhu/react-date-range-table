import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { CalendarOutlined, LeftOutlined, RightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAppStore, TIMEZONES, MAX_DAYS, MAX_PAST_DAYS } from '../store/useAppStore';
import { DATE_MESSAGES } from '../data/dateMessages';

dayjs.extend(utc);
dayjs.extend(timezone);

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const DateRangePicker: React.FC = () => {
  // Pull timezone + dates from store — component re-renders on any change
  const timezone   = useAppStore(s => s.timezone);
  const startDate  = useAppStore(s => s.startDate);
  const endDate    = useAppStore(s => s.endDate);
  const setTimezone  = useAppStore(s => s.setTimezone);
  const setDateRange = useAppStore(s => s.setDateRange);
  const fetchData    = useAppStore(s => s.fetchData);

  const [open, setOpen]             = useState(false);
  const [viewDate, setViewDate]     = useState<Dayjs>(dayjs());
  const [hoverDate, setHoverDate]   = useState<Dayjs | null>(null);
  const [selecting, setSelecting]   = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart]   = useState<Dayjs | null>(startDate);
  const [tempEnd,   setTempEnd]     = useState<Dayjs | null>(endDate);
  const [maxTipDate, setMaxTipDate] = useState<Dayjs | null>(null);
  const [addTime, setAddTime]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (ref.current?.contains(target)) return;
      if (target.closest?.('.ant-select-dropdown')) return;  
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync temp dates when panel opens so it reflects latest confirmed range
  useEffect(() => {
    if (open) {
      setTempStart(startDate);
      setTempEnd(endDate);
      setSelecting('start');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute minDate whenever timezone changes
  const minDate = useMemo(
    () => dayjs().tz(timezone).subtract(MAX_PAST_DAYS, 'day').startOf('day'),
    [timezone]
  );

  // Recompute trigger label whenever timezone, dates or addTime changes
  const tzOffset = useMemo(
    () => TIMEZONES.find(t => t.value === timezone)?.offset ?? '',
    [timezone]
  );

  const displayLabel = useMemo(() => {
    if (!startDate || !endDate) return 'Select date range';
    const fmt    = addTime ? 'DD MMM HH:mm' : 'DD MMM';
    const fmtEnd = addTime ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY';
    const s = startDate.tz(timezone).format(fmt);
    const e = endDate.tz(timezone).format(fmtEnd);
    return `${s} – ${e} ${tzOffset}`;
  }, [startDate, endDate, timezone, tzOffset, addTime]);

  const getDateInfo = (d: Dayjs) =>
    DATE_MESSAGES.find(m => m.date === d.format('YYYY-MM-DD')) ?? null;

  const isDisabled = (d: Dayjs) =>
    d.isBefore(minDate, 'day') || getDateInfo(d)?.disabled === true;

  const isInRange = (d: Dayjs) => {
    const end = tempEnd ?? hoverDate;
    if (!tempStart || !end) return false;
    const [s, e] = tempStart.isBefore(end) ? [tempStart, end] : [end, tempStart];
    return d.isAfter(s, 'day') && d.isBefore(e, 'day');
  };

  const isStartDate = (d: Dayjs) => !!tempStart && d.isSame(tempStart, 'day');
  const isEndDate   = (d: Dayjs) => {
    const end = tempEnd ?? (selecting === 'end' ? hoverDate : null);
    return !!end && d.isSame(end, 'day');
  };

  const handleDayClick = (d: Dayjs) => {
    if (isDisabled(d)) return;
    if (selecting === 'start') {
      setTempStart(d); setTempEnd(null); setSelecting('end');
    } else if (tempStart) {
      const diff = Math.abs(d.diff(tempStart, 'day'));
      if (diff >= MAX_DAYS) {
        setMaxTipDate(d);
        setTimeout(() => setMaxTipDate(null), 2000);
        return;
      }
      if (d.isBefore(tempStart, 'day')) { setTempEnd(tempStart); setTempStart(d); }
      else setTempEnd(d);
      setSelecting('start');
    }
  };

  const handleGo = () => {
    if (tempStart && tempEnd) {
      setDateRange(tempStart, tempEnd);
      setOpen(false);
      fetchData();
    }
  };

  const handleCancel = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setSelecting('start');
    setOpen(false);
  };

  const buildCells = () => {
    const firstDay    = viewDate.startOf('month').day();
    const daysInMonth = viewDate.daysInMonth();
    const prevDays    = viewDate.subtract(1, 'month').daysInMonth();
    const cells: { day: Dayjs; currentMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({ day: viewDate.subtract(1, 'month').date(prevDays - i), currentMonth: false });
    for (let i = 1; i <= daysInMonth; i++)
      cells.push({ day: viewDate.date(i), currentMonth: true });
    for (let i = 1; cells.length < 42; i++)
      cells.push({ day: viewDate.add(1, 'month').date(i), currentMonth: false });
    return cells;
  };

  const cells = buildCells();

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        data-testid="picker-trigger"
        onClick={() => setOpen(o => !o)}
        className={`picker-trigger ${open ? 'open' : ''}`}
      >
        <CalendarOutlined className="text-primary" />
        <span>{displayLabel}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="calendar-panel" data-testid="calendar-panel">

          {/* Timezone selector */}
          <div className="flex items-center gap-2 mb-4">
            <ClockCircleOutlined className="text-gray-400" />
            <Select
              value={timezone}
              onChange={setTimezone}  
              className="flex-1"
              size="small"
              options={TIMEZONES.map(t => ({ label: t.label, value: t.value }))}
              data-testid="timezone-select"
            />
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button className="nav-btn" data-testid="prev-month"
              onClick={() => setViewDate(d => d.subtract(1, 'month'))}>
              <LeftOutlined className="text-xs" />
            </button>
            <span className="font-semibold text-[15px] text-gray-800" data-testid="month-label">
              {MONTHS[viewDate.month()]} {viewDate.year()}
            </span>
            <button className="nav-btn" data-testid="next-month"
              onClick={() => setViewDate(d => d.add(1, 'month'))}>
              <RightOutlined className="text-xs" />
            </button>
          </div>

          {/* Day headers */}
          <div className="days-header">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-0.5" data-testid="calendar-grid">
            {cells.map(({ day, currentMonth }, idx) => {
              const disabled   = isDisabled(day);
              const inRange    = isInRange(day);
              const isStart    = isStartDate(day);
              const isEnd      = isEndDate(day);
              const isToday    = day.isSame(dayjs(), 'day');
              const info       = getDateInfo(day);
              const showMaxTip = !!maxTipDate && day.isSame(maxTipDate, 'day');

              const cellClass = [
                'day-cell',
                disabled                                              ? 'disabled'    : '',
                !currentMonth                                         ? 'other-month' : '',
                inRange                                               ? 'in-range'    : '',
                isStart                                               ? 'is-start'    : '',
                isEnd                                                 ? 'is-end'      : '',
                isToday                                               ? 'is-today'    : '',
                !disabled && !isStart && !isEnd && currentMonth       ? 'normal'      : '',
              ].filter(Boolean).join(' ');

              return (
                <Tooltip
                  key={idx}
                  title={showMaxTip ? `Max ${MAX_DAYS} days` : info?.message ?? ''}
                  open={showMaxTip ? true : undefined}
                  color={showMaxTip ? '#262626' : '#595959'}
                >
                  <div
                    className={cellClass}
                    onClick={() => currentMonth && !disabled && handleDayClick(day)}
                    onMouseEnter={() => selecting === 'end' && setHoverDate(day)}
                    onMouseLeave={() => setHoverDate(null)}
                    data-testid={currentMonth ? `day-${day.format('YYYY-MM-DD')}` : undefined}
                  >
                    {day.date()}
                    {info && !info.disabled && <span className="date-dot" />}
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {/* Range label */}
          <div className="range-display" data-testid="range-display">
            {tempStart && tempEnd
              ? `${tempStart.format('DD MMM YYYY')} – ${tempEnd.format('DD MMM YYYY')}`
              : tempStart
              ? `${tempStart.format('DD MMM YYYY')} – select end date`
              : 'Select start date'}
          </div>

          {/* Add time toggle */}
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[13px] text-gray-500">Add time</span>
            <button
              onClick={() => setAddTime(t => !t)}
              className={`toggle-track ${addTime ? 'bg-primary' : 'bg-gray-300'}`}
              data-testid="add-time-toggle"
            >
              <span className={`toggle-thumb ${addTime ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3.5">
            <Button size="small" onClick={handleCancel}>Cancel</Button>
            <Button size="small" type="primary"
              disabled={!tempStart || !tempEnd}
              onClick={handleGo}
              data-testid="go-btn">
              Go
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};
