import { JSX, ReactNode } from 'react';
import { Card, ScrollArea, Skeleton, Table, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import * as React from 'react';
import { usePermissions } from '@/modules/auth/hooks/usePermissions';

export type Column<T, V = unknown> = {
  id: string;
  header: ReactNode;
  accessor: keyof T | ((row: T) => V);
  cell?: (value: V, row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string | number;
};

export type RowActions<T> = {
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  width?: string | number;
};

export type DataTableProps<T> = {
  data: ReadonlyArray<T>;
  columns: ReadonlyArray<Column<T, unknown>>;
  rowKey: (row: T) => React.Key;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  minWidth?: number | string;
  striped?: boolean;
  stickyHeader?: boolean;
  rowActions?: RowActions<T>;
  showActions?: boolean;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  empty,
  className,
  minWidth = 720,
  striped = false,
  stickyHeader = true,
  rowActions,
  showActions = true,
}: DataTableProps<T>): JSX.Element {
  const hasRows = data.length > 0;
  const { canEdit, canDelete } = usePermissions();

  const hasActionCol = showActions === true;
  const actionColWidth = rowActions?.width ?? 140;

  const headColSpan = columns.length + (hasActionCol ? 1 : 0);

  return (
    <Card withBorder radius="lg" p="0" className={className}>
      <ScrollArea type="auto">
        <Table
          verticalSpacing="sm"
          horizontalSpacing="md"
          highlightOnHover
          striped={striped}
          className="w-full border-separate border-spacing-0"
          style={{ minWidth }}
        >
          <Table.Thead
            className={cn(
              'text-left text-sm text-[color:var(--muted,rgba(0,0,0,0.6))]',
              stickyHeader && 'sticky top-0 z-10 bg-[var(--surface)]',
            )}
          >
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th
                  key={col.id}
                  className="border-b border-[var(--border)] px-4 py-3 font-medium"
                  style={{ width: col.width }}
                  align={col.align}
                >
                  {col.header}
                </Table.Th>
              ))}

              {hasActionCol && (
                <Table.Th
                  key="__actions"
                  className="border-b border-[var(--border)] px-4 py-3 font-medium"
                  style={{ width: actionColWidth }}
                  align="left"
                >
                  Ações
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Table.Tr key={`s-${i}`} className="text-sm">
                  {columns.map((col) => (
                    <Table.Td
                      key={`s-${i}-${col.id}`}
                      className="border-b border-[var(--border)] px-4 py-3"
                      align={col.align}
                    >
                      <Skeleton h={14} />
                    </Table.Td>
                  ))}
                  {hasActionCol && (
                    <Table.Td className="border-b border-[var(--border)] px-4 py-3">
                      <Skeleton h={14} />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : !hasRows ? (
              <Table.Tr>
                <Table.Td colSpan={headColSpan} className="px-4 py-10 text-center">
                  {empty ?? (
                    <Text c="dimmed" size="sm">
                      Sem resultados
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row, index) => (
                <Table.Tr key={rowKey(row)} className="text-sm">
                  {columns.map((col) => {
                    const value =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row as Record<string, unknown>)[col.accessor as string];
                    return (
                      <Table.Td
                        key={col.id}
                        className={cn('border-b border-[var(--border)] px-4 py-3', col.className)}
                        align={col.align}
                      >
                        {col.cell ? col.cell(value as never, row, index) : (value as ReactNode)}
                      </Table.Td>
                    );
                  })}

                  {hasActionCol && (
                    <Table.Td className="border-b border-[var(--border)] px-4 py-3">
                      <Group gap="xs">
                        <Tooltip
                          label={!canEdit ? 'Sem permissão' : (rowActions?.editLabel ?? 'Editar')}
                          withArrow
                        >
                          <ActionIcon
                            variant="light"
                            aria-label={rowActions?.editLabel ?? 'Editar'}
                            disabled={!canEdit || !rowActions?.onEdit}
                            onClick={() => rowActions?.onEdit?.(row)}
                          >
                            <Pencil className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip
                          label={
                            !canDelete ? 'Sem permissão' : (rowActions?.deleteLabel ?? 'Remover')
                          }
                          withArrow
                        >
                          <ActionIcon
                            variant="light"
                            color="red"
                            aria-label={rowActions?.deleteLabel ?? 'Remover'}
                            disabled={!canDelete || !rowActions?.onDelete}
                            onClick={() => rowActions?.onDelete?.(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
