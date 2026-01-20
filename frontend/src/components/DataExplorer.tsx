import { useState } from 'react';
import { DataGrid } from 'react-data-grid';
import type { QueryResult } from '../types';

const ROW_LIMIT = 100;

interface DataExplorerProps {
  tableNames: string[];
  onQueryTable: (tableName: string, limit: number, offset: number) => QueryResult;
  onCountTable: (tableName: string) => number;
}

export function DataExplorer({ tableNames, onQueryTable, onCountTable }: DataExplorerProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    const total = onCountTable(tableName);
    setTotalCount(total);
    const result = onQueryTable(tableName, ROW_LIMIT + 1, 0);
    const hasMoreRows = result.rows.length > ROW_LIMIT;
    setTableData({
      columns: result.columns,
      rows: hasMoreRows ? result.rows.slice(0, ROW_LIMIT) : result.rows,
    });
    setLoadedCount(Math.min(result.rows.length, ROW_LIMIT));
    setHasMore(hasMoreRows);
  };

  const handleLoadMore = () => {
    if (!selectedTable) return;
    const result = onQueryTable(selectedTable, ROW_LIMIT + 1, loadedCount);
    const hasMoreRows = result.rows.length > ROW_LIMIT;
    const newRows = hasMoreRows ? result.rows.slice(0, ROW_LIMIT) : result.rows;
    setTableData((prev) => prev ? {
      columns: prev.columns,
      rows: [...prev.rows, ...newRows],
    } : null);
    setLoadedCount((prev) => prev + newRows.length);
    setHasMore(hasMoreRows);
  };

  const handleLoadAll = () => {
    if (!selectedTable) return;
    const remaining = totalCount - loadedCount;
    const result = onQueryTable(selectedTable, remaining, loadedCount);
    setTableData((prev) => prev ? {
      columns: prev.columns,
      rows: [...prev.rows, ...result.rows],
    } : null);
    setLoadedCount(totalCount);
    setHasMore(false);
  };

  const columns = tableData?.columns.map((col) => ({
    key: col,
    name: col,
    resizable: true,
    minWidth: 80,
    renderCell: ({ row }: { row: Record<string, unknown> }) => {
      const value = row[col];
      const stringValue = value == null ? '' : String(value);
      return (
        <div className="cell-content" title={stringValue}>
          {stringValue}
        </div>
      );
    },
  })) ?? [];

  const rows = tableData?.rows.map((row, idx) => {
    const rowObj: Record<string, unknown> = { __idx: idx };
    tableData.columns.forEach((col, colIdx) => {
      rowObj[col] = row[colIdx];
    });
    return rowObj;
  }) ?? [];

  return (
    <div className="data-explorer">
      <div className="data-explorer-sidebar">
        <div className="data-explorer-title">Tables</div>
        <ul className="data-explorer-tables">
          {tableNames.map((name) => (
            <li key={name}>
              <button
                className={`data-explorer-table-btn ${selectedTable === name ? 'selected' : ''}`}
                onClick={() => handleTableClick(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="data-explorer-content">
        {selectedTable && tableData ? (
          <>
            <div className="data-explorer-header">
              <span className="data-explorer-table-name">{selectedTable}</span>
              <span className="data-explorer-row-count">
                {hasMore ? (
                  <>
                    {loadedCount} of {totalCount} rows (
                    <button className="load-more-link" onClick={handleLoadMore}>
                      load more
                    </button>
                    {' | '}
                    <button className="load-more-link" onClick={handleLoadAll}>
                      load all
                    </button>
                    )
                  </>
                ) : (
                  <>{loadedCount} rows</>
                )}
              </span>
            </div>
            <div className="data-explorer-grid">
              <DataGrid
                columns={columns}
                rows={rows}
                rowKeyGetter={(row: Record<string, unknown>) => row.__idx as number}
                className="data-grid"
              />
            </div>
          </>
        ) : (
          <div className="data-explorer-placeholder">
            Select a table to view its data
          </div>
        )}
      </div>
    </div>
  );
}
