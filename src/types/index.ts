export interface TableRecord {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'Active' | 'Pending' | 'Inactive' | 'Completed';
  category: string;
}

export interface DateMessage {
  date: string; // format: YYYY-MM-DD
  message: string;
  disabled?: boolean;
}

export type SortOrder = 'ascend' | 'descend' | null;

export interface SortState {
  column: keyof TableRecord | null;
  order: SortOrder;
}
