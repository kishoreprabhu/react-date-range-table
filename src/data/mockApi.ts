import { TableRecord } from '../types';

const NAMES = [
  'Alice Johnson', 'Bob Martinez', 'Carol White', 'David Lee', 'Eva Brown',
  'Frank Wilson', 'Grace Davis', 'Henry Taylor', 'Iris Moore', 'James Anderson',
  'Karen Thomas', 'Liam Jackson', 'Mia Harris', 'Noah Martin', 'Olivia Garcia',
];

const STATUSES: TableRecord['status'][] = ['Active', 'Pending', 'Inactive', 'Completed'];
const CATEGORIES = ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateRecordsForRange(startDate: string, endDate: string): TableRecord[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const count = Math.min(Math.max(daysDiff * 2, 5), 40);
  const records: TableRecord[] = [];

  for (let i = 0; i < count; i++) {
    const seed = i + start.getTime() / 1_000_000;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);
    const r5 = seededRandom(seed + 4);

    const dayOffset = Math.floor(r1 * daysDiff);
    const recordDate = new Date(start.getTime() + dayOffset * 86_400_000);

    records.push({
      id: `REC-${1000 + i}`,
      name: NAMES[Math.floor(r2 * NAMES.length)],
      date: recordDate.toISOString().split('T')[0],
      amount: Math.round(r3 * 9900 + 100),
      status: STATUSES[Math.floor(r4 * STATUSES.length)],
      category: CATEGORIES[Math.floor(r5 * CATEGORIES.length)],
    });
  }

  return records.sort((a, b) => a.date.localeCompare(b.date));
}

export interface FetchPayload {
  startDate: string; // e.g. "2024-12-10 00:00:00 +0530"
  endDate: string;
  timezone: string;
}

export async function fetchTableData(payload: FetchPayload): Promise<TableRecord[]> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 600));
  const startPart = payload.startDate.split(' ')[0];
  const endPart = payload.endDate.split(' ')[0];
  return generateRecordsForRange(startPart, endPart);
}
