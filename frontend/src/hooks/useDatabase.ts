import { useCallback, useRef, useState } from 'react';
import initSqlJs, { type Database } from 'sql.js';
import type { BusinessData, QueryResult } from '../types';

export function useDatabase() {
  const dbRef = useRef<Database | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [schema, setSchema] = useState<string>('');

  const initDatabase = useCallback(async (data: BusinessData) => {
    setIsLoading(true);
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });

      const db = new SQL.Database();
      dbRef.current = db;

      const schemaStatements: string[] = [];

      for (const [tableName, tableData] of Object.entries(data.tables)) {
        const columnDefs = tableData.columns
          .map((col) => {
            const sampleValue = tableData.rows[0]?.[tableData.columns.indexOf(col)];
            const type = typeof sampleValue === 'number'
              ? (Number.isInteger(sampleValue) ? 'INTEGER' : 'REAL')
              : 'TEXT';
            return `${col} ${type}`;
          })
          .join(', ');

        const createStatement = `CREATE TABLE ${tableName} (${columnDefs})`;
        schemaStatements.push(createStatement);
        db.run(createStatement);

        for (const row of tableData.rows) {
          const placeholders = row.map(() => '?').join(', ');
          const insertStatement = `INSERT INTO ${tableName} VALUES (${placeholders})`;
          db.run(insertStatement, row);
        }
      }

      setSchema(schemaStatements.join(';\n') + ';');
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeQuery = useCallback((sql: string): QueryResult => {
    if (!dbRef.current) {
      throw new Error('Database not initialized');
    }

    const result = dbRef.current.exec(sql);
    if (result.length === 0) {
      return { columns: [], rows: [] };
    }

    return {
      columns: result[0].columns,
      rows: result[0].values as (string | number | null)[][],
    };
  }, []);

  return {
    initDatabase,
    executeQuery,
    isLoading,
    isReady,
    schema,
  };
}
