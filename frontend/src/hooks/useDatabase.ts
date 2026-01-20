import { useCallback, useRef, useState } from 'react';
import initSqlJs, { type Database } from 'sql.js';
import type { BusinessData, QueryResult } from '../types';
import type { ERDSchema, TableSchema, TableColumn } from '../components/ERDDiagram';

export function useDatabase() {
  const dbRef = useRef<Database | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [schema, setSchema] = useState<string>('');
  const [erdSchema, setErdSchema] = useState<ERDSchema | null>(null);
  const [schemaVersion, setSchemaVersion] = useState(0);

  const initDatabase = useCallback(async (data: BusinessData) => {
    setIsLoading(true);
    setErdSchema(null); // Reset before loading new schema
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

      // Build ERD schema from the database
      const tableNames = Object.keys(data.tables);
      const tables: TableSchema[] = [];

      for (const tableName of tableNames) {
        const tableInfo = db.exec(`PRAGMA table_info(${tableName})`);
        if (tableInfo.length === 0) continue;

        const columns: TableColumn[] = tableInfo[0].values.map((row) => {
          const colName = row[1] as string;
          const colType = row[2] as string;
          const isPk = row[5] === 1;

          // Infer foreign keys from naming convention: xxx_id -> xxx or xxxs table
          let isFk = false;
          let references: { table: string; column: string } | undefined;

          if (colName.endsWith('_id') && !isPk) {
            const refTableBase = colName.slice(0, -3); // Remove '_id'
            // Check if referenced table exists (try singular and plural forms)
            const possibleTables = [refTableBase, refTableBase + 's', refTableBase + 'es'];
            for (const possibleTable of possibleTables) {
              if (tableNames.includes(possibleTable)) {
                isFk = true;
                references = { table: possibleTable, column: 'id' };
                break;
              }
            }
          }

          return {
            name: colName,
            type: colType,
            isPrimaryKey: isPk,
            isForeignKey: isFk,
            references,
          };
        });

        tables.push({ name: tableName, columns });
      }

      setErdSchema({ tables });
      setSchemaVersion(v => v + 1);
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
    erdSchema,
    schemaVersion,
  };
}
