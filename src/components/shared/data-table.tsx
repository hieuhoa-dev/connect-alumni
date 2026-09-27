"use client";

import * as React from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

// Static features registered at module scope according to TanStack Table v9 architecture
const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

// Stable fallback array at module scope to avoid re-render invalidations
const EMPTY_DATA: any[] = [];

export type DataTableFeatures = typeof features;

export interface DataTableProps<
  TData extends Record<string, any> = any,
  TValue = any,
> {
  columns:
    | readonly ColumnDef<DataTableFeatures, TData, TValue>[]
    | readonly any[];
  data?: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export const DataTable = <
  TData extends Record<string, any> = any,
  TValue = any,
>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useTable({
    features,
    data: data ?? EMPTY_DATA,
    columns: columns as readonly ColumnDef<DataTableFeatures, TData, any>[],
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-8 text-xs h-9 bg-background"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground text-xs h-10 px-4"
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/50 text-xs"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  Không tìm thấy dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-sans">
        <div>
          Trang{" "}
          <span className="font-medium text-foreground">
            {table.state.pagination.pageIndex + 1}
          </span>{" "}
          /{" "}
          <span className="font-medium text-foreground">
            {table.getPageCount() || 1}
          </span>{" "}
          ({data?.length ?? 0} bản ghi)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2.5 text-xs font-normal"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2.5 text-xs font-normal"
          >
            Sau
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
