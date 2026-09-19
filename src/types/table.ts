import { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
}

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface TableFilterConfig {
  key: string;
  label: string;
  options: TableFilterOption[];
}
