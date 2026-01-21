import { DataGrid } from 'react-data-grid';
import * as XLSX from 'xlsx';
import type { QueryResult } from '../types';
import 'react-data-grid/lib/styles.css';

type RowType = Record<string, string | number | null>;

interface DataTableProps {
  result: QueryResult | null;
  sql: string;
  onSqlChange: (sql: string) => void;
  onRunSql: () => void;
  isRunning?: boolean;
}

export function DataTable({ result, sql, onSqlChange, onRunSql, isRunning }: DataTableProps) {
  const hasResults = result && result.rows.length > 0;

  const handleDownloadExcel = () => {
    if (!result) return;

    const worksheetData = [result.columns, ...result.rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'query-results.xlsx');
  };

  const columns = hasResults
    ? result.columns.map((col) => ({
        key: col,
        name: col,
        resizable: true,
        sortable: true,
      }))
    : [];

  const rows = hasResults
    ? result.rows.map((row, idx) => {
        const rowObj: Record<string, string | number | null> = { _id: idx };
        result.columns.forEach((col, colIdx) => {
          rowObj[col] = row[colIdx];
        });
        return rowObj;
      })
    : [];

  return (
    <div className="data-table-container">
      <div className="sql-editor">
        <textarea
          value={sql}
          onChange={(e) => onSqlChange(e.target.value)}
          placeholder="Enter SQL query or ask a question above..."
          className="sql-textarea"
          spellCheck={false}
        />
        <button
          onClick={onRunSql}
          disabled={!sql.trim() || isRunning}
          className="run-sql-btn"
        >
          {isRunning ? 'Running...' : 'Run SQL'}
        </button>
      </div>

      {hasResults ? (
        <>
          <div className="data-grid-wrapper">
            <DataGrid
              columns={columns}
              rows={rows}
              rowKeyGetter={(row: RowType) => row._id as number}
              className="data-grid"
            />
          </div>
          <div className="row-count">
            <span>{result.rows.length} row{result.rows.length !== 1 ? 's' : ''}</span>
            <button className="download-excel-btn" onClick={handleDownloadExcel}>
              Download Excel
            </button>
          </div>
        </>
      ) : (
        <div className="data-table-empty-inner">
          <p>No results to display. Run a query to see data.</p>
        </div>
      )}
    </div>
  );
}
