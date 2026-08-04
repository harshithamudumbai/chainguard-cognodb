import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Column<T> {
  header: string;
  accessor: (row: T, index: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick, 
  emptyMessage = "No data available",
  className 
}: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto w-full", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-card-border bg-muted-light/50">
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={cn(
                  "py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider",
                  col.align === 'right' && "text-right",
                  col.align === 'center' && "text-center",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={keyExtractor(row)} 
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-card-border last:border-0 hover:bg-muted-light/30 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, i) => (
                  <td 
                    key={i} 
                    className={cn(
                      "py-3 px-4 text-sm text-foreground",
                      col.align === 'right' && "text-right",
                      col.align === 'center' && "text-center",
                      col.className
                    )}
                  >
                    {col.accessor(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
