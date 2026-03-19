import dayjs from 'dayjs';
import { DateMessage } from '../types';

const today = dayjs();

export const DATE_MESSAGES: DateMessage[] = [
  {
    date: today.add(2, 'day').format('YYYY-MM-DD'),
    message: '🚀 Sprint planning day',
    disabled: false,
  },
  {
    date: today.subtract(5, 'day').format('YYYY-MM-DD'),
    message: '📅 Team retrospective',
    disabled: false,
  },
  {
    date: today.subtract(10, 'day').format('YYYY-MM-DD'),
    message: '🔒 System maintenance — limited access',
    disabled: true,
  },
  {
    date: today.subtract(15, 'day').format('YYYY-MM-DD'),
    message: '🎉 Product release v2.0',
    disabled: false,
  },
  {
    date: today.subtract(20, 'day').format('YYYY-MM-DD'),
    message: '⚠️ Data migration window',
    disabled: true,
  },
  {
    date: today.subtract(30, 'day').format('YYYY-MM-DD'),
    message: '📊 Monthly reporting deadline',
    disabled: false,
  },
  {
    date: today.subtract(45, 'day').format('YYYY-MM-DD'),
    message: '🔧 Infrastructure upgrade',
    disabled: true,
  },
];
