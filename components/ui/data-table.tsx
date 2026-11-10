"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./choice";
import { EmptyState } from "./display";
import { Icon } from "./icon";
import { Input } from "./input";
import { Pagination } from "./navigation";
import { Skeleton } from "./spinner";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** How to render the cell. Defaults to the accessor value. */
  cell?: (row: T) => ReactNode;
  /** Raw value used for sorting and searching */
  accessor?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  /** Include this column in the search box */
  searchable?: boolean;
  align?: "left" | "right" | "center";
  /** Use for numbers: right-aligned monospaced digits */
  numeric?: boolean;
  width?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
  /** Footer cell, e.g. a total */
  footer?: (rows: T[]) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  /** Show search box (searches columns marked searchable) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra controls next to the search box (filters, buttons) */
  toolbar?: ReactNode;
  /** Bulk-action bar shown when rows are selected */
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode;
  selectable?: boolean;
  /** Actions column at the end of each row */
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  loading?: boolean;
  empty?: ReactNode;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  dense?: boolean;
  className?: string;
}

type Sort = { key: string; dir: "asc" | "desc" } | null;

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchable = true,
  searchPlaceholder = "Search…",
  toolbar,
  bulkActions,
  selectable,
  rowActions,
  onRowClick,
  pageSize = 10,
  loading,
  empty,
  defaultSort,
  dense,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const searchCols = columns.filter((c) => c.searchable && c.accessor);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || searchCols.length === 0) return data;
    return data.filter((row) => searchCols.some((c) => String(c.accessor!(row) ?? "").toLowerCase().includes(q)));
  }, [data, query, searchCols]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.accessor) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => setPage(1), [query, pageSize]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const pageIds = pageRows.map(getRowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  // Drop selections for rows that no longer exist
  useEffect(() => {
    const ids = new Set(data.map(getRowId));
    setSelected((s) => {
      const next = new Set([...s].filter((id) => ids.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [data, getRowId]);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  const toggleRow = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allOnPage) pageIds.forEach((id) => n.delete(id));
      else pageIds.forEach((id) => n.add(id));
      return n;
    });

  const clear = () => setSelected(new Set());
  const hasFooter = columns.some((c) => c.footer);
  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const cellPad = dense ? "px-3 py-2" : "px-4 py-3";

  const alignClass = (c: Column<T>) =>
    c.align === "right" || (c.numeric && c.align !== "left" && c.align !== "center")
      ? "text-right"
      : c.align === "center"
        ? "text-center"
        : "text-left";

  return (
    <div className={cn("overflow-hidden rounded-lg bg-surface shadow-sm", className)}>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
          {selectable && selected.size > 0 && bulkActions ? (
            <div className="flex w-full flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-fg">{selected.size} selected</span>
              {bulkActions([...selected], clear)}
              <button type="button" onClick={clear} className="ml-auto text-[13px] font-semibold text-muted hover:text-fg">
                Clear selection
              </button>
            </div>
          ) : (
            <>
              {searchable && (
                <Input
                  icon="search"
                  size="sm"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search table"
                  wrapperClassName="w-full rounded-full! bg-surface-2 border-transparent! sm:max-w-xs"
                />
              )}
              {toolbar && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{toolbar}</div>}
            </>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-line bg-surface-2/60">
              {selectable && (
                <th className={cn("w-10", cellPad)}>
                  <Checkbox
                    aria-label="Select all on page"
                    checked={allOnPage}
                    indeterminate={!allOnPage && someOnPage}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const ariaSort = active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(
                      "text-xs font-semibold whitespace-nowrap text-muted",
                      cellPad,
                      alignClass(c),
                      c.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {c.sortable && c.accessor ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-fg",
                          active && "text-fg",
                          alignClass(c) === "text-right" && "flex-row-reverse",
                        )}
                      >
                        {c.header}
                        <Icon
                          name={active ? (sort!.dir === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down"}
                          size={13}
                          strokeWidth={2.2}
                          className={active ? "text-fg" : "opacity-50"}
                        />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && <th className={cn("w-12", cellPad)} aria-label="Actions" />}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-line last:border-0">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className={cellPad}>
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && pageRows.length === 0 && (
              <tr>
                <td colSpan={colCount}>
                  {empty ?? (
                    <EmptyState
                      icon={query ? "search" : "inbox"}
                      title={query ? "No results" : "Nothing here yet"}
                      description={query ? `Nothing matches “${query}”. Try a different search.` : undefined}
                    />
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              pageRows.map((row) => {
                const id = getRowId(row);
                const isSel = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-line transition-colors last:border-0",
                      isSel ? "bg-accent-soft" : "hover:bg-surface-2/70",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {selectable && (
                      <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                        <Checkbox aria-label="Select row" checked={isSel} onChange={() => toggleRow(id)} />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          cellPad,
                          "text-fg",
                          alignClass(c),
                          c.numeric && "font-mono whitespace-nowrap tabular-nums",
                          c.hideOnMobile && "hidden md:table-cell",
                          c.className,
                        )}
                      >
                        {c.cell ? c.cell(row) : (c.accessor?.(row) ?? "—")}
                      </td>
                    ))}
                    {rowActions && (
                      <td className={cn(cellPad, "text-right")} onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>

          {hasFooter && !loading && sorted.length > 0 && (
            <tfoot>
              <tr className="border-t border-line bg-surface-2/60 font-semibold">
                {selectable && <td className={cellPad} />}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      cellPad,
                      alignClass(c),
                      c.numeric && "font-mono tabular-nums",
                      c.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {c.footer?.(sorted)}
                  </td>
                ))}
                {rowActions && <td className={cellPad} />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="border-t border-line px-4 py-3">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={sorted.length} pageSize={pageSize} />
        </div>
      )}
    </div>
  );
}
