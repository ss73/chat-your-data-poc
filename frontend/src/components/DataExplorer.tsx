import { useState } from 'react';
import { DataGrid } from 'react-data-grid';
import type { QueryResult } from '../types';

interface DataExplorerProps {
  tableNames: string[];
  onQueryTable: (tableName: string) => QueryResult;
}

export function DataExplorer({ tableNames, onQueryTable }: DataExplorerProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<QueryResult | null>(null);

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    const result = onQueryTable(tableName);
    setTableData(result);
  };

  const columns = tableData?.columns.map((col) => ({
    key: col,
    name: col,
    resizable: true,
    minWidth: 80,
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
              <span className="data-explorer-row-count">{tableData.rows.length} rows</span>
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
