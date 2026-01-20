import { useEffect, useState, useCallback, useMemo } from 'react';
import { ChatInput } from './components/ChatInput';
import { DataTable } from './components/DataTable';
import { Visualization } from './components/Visualization';
import { SavedQueries } from './components/SavedQueries';
import { DatasetSelector } from './components/DatasetSelector';
import { ERDDiagram } from './components/ERDDiagram';
import { DataExplorer } from './components/DataExplorer';
import { useDatabase } from './hooks/useDatabase';
import { useSavedQueries } from './hooks/useSavedQueries';
import { fetchBusinessData, fetchDatasets, generateSQL } from './services/api';
import type { QueryResult, PlotlyConfig, SavedQuery, DatasetsMap } from './types';
import './App.css';

const DATASET_SUGGESTIONS: Record<string, string[]> = {
  sales: [
    'Show me total sales by region',
    'What are the top 5 products by revenue?',
    'Which customers have spent the most?',
    'Show monthly sales trend',
  ],
  hr: [
    'Show average salary by department',
    'Which employees have the highest performance scores?',
    'How many employees were hired each year?',
    'List all departments and their locations',
  ],
  inventory: [
    'Which products are below reorder level?',
    'Show total stock by warehouse',
    'Which suppliers provide the most products?',
    'List products with their suppliers',
  ],
  support: [
    'Show ticket count by priority',
    'Which agents have resolved the most tickets?',
    'What is the average resolution time by category?',
    'Show open tickets by customer plan',
  ],
  security: [
    'How many patrols had deviations last month?',
    'Which sites have the most checkpoints?',
    'Show patrol reports with deviations by site',
    'Which officers completed the most patrols?',
  ],
};

function App() {
  const [currentDataset, setCurrentDataset] = useState('sales');
  const [datasets, setDatasets] = useState<DatasetsMap>({});
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  const { initDatabase, executeQuery, isLoading: dbLoading, isReady, schema, erdSchema, schemaVersion } = useDatabase();
  const { savedQueries, saveQuery, deleteQuery } = useSavedQueries(currentDataset);

  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentSql, setCurrentSql] = useState('');
  const [vizConfig, setVizConfig] = useState<PlotlyConfig | null>(null);
  const [vizScript, setVizScript] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erdExpanded, setErdExpanded] = useState(false);
  const [schemaTab, setSchemaTab] = useState<'schema' | 'data'>('schema');

  const tableNames = useMemo(() => {
    return erdSchema?.tables.map(t => t.name) ?? [];
  }, [erdSchema]);

  const handleQueryTable = useCallback((tableName: string, limit: number, offset: number): QueryResult => {
    return executeQuery(`SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`);
  }, [executeQuery]);

  const handleCountTable = useCallback((tableName: string): number => {
    const result = executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
    return result.rows[0]?.[0] as number ?? 0;
  }, [executeQuery]);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const datasetsData = await fetchDatasets();
        setDatasets(datasetsData);
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      }
    }
    loadDatasets();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchBusinessData(currentDataset);
        await initDatabase(data);
        setQueryResult(null);
        setCurrentQuestion('');
        setCurrentSql('');
        setVizConfig(null);
        setVizScript(null);
        setError(null);
      } catch (err) {
        setError('Failed to load business data. Make sure the backend is running.');
        console.error(err);
      }
    }
    loadData();
  }, [initDatabase, currentDataset]);

  const handleQuery = useCallback(
    async (question: string) => {
      setIsQuerying(true);
      setError(null);
      setVizConfig(null);
      setVizScript(null);

      try {
        const sql = await generateSQL(question, schema);
        setCurrentQuestion(question);
        setCurrentSql(sql);

        const result = executeQuery(sql);
        setQueryResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed');
        console.error(err);
      } finally {
        setIsQuerying(false);
      }
    },
    [schema, executeQuery]
  );

  const handleSaveQuery = useCallback(
    (name: string) => {
      saveQuery({
        name,
        question: currentQuestion,
        sql: currentSql,
        vizScript,
      });
    },
    [currentQuestion, currentSql, vizScript, saveQuery]
  );

  const handleSelectSaved = useCallback(
    (query: SavedQuery) => {
      setCurrentQuestion(query.question);
      setCurrentSql(query.sql);
      setVizScript(query.vizScript ?? null);
      setVizConfig(null);
      setError(null);

      try {
        const result = executeQuery(query.sql);
        setQueryResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query execution failed');
      }
    },
    [executeQuery]
  );

  const handleRunSql = useCallback(() => {
    if (!currentSql.trim()) return;

    setError(null);
    setVizConfig(null);
    setVizScript(null);

    try {
      const result = executeQuery(currentSql);
      setQueryResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SQL execution failed');
    }
  }, [currentSql, executeQuery]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>Chat Your Data</h1>
            <p className="subtitle">Ask questions about your business data in natural language</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {Object.keys(datasets).length > 0 && (
              <DatasetSelector
                datasets={datasets}
                selected={currentDataset}
                onSelect={setCurrentDataset}
                disabled={dbLoading}
              />
            )}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <SavedQueries
            queries={savedQueries}
            onSelect={handleSelectSaved}
            onDelete={deleteQuery}
            currentQuestion={currentQuestion}
            currentSql={currentSql}
            onSave={handleSaveQuery}
          />
        </aside>

        <main className="content">
          {dbLoading && (
            <div className="loading-overlay">
              <p>Loading database...</p>
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          <ChatInput
            onSubmit={handleQuery}
            isLoading={isQuerying}
            disabled={!isReady}
            suggestions={DATASET_SUGGESTIONS[currentDataset]}
          />

          <div className="erd-section">
            <button
              className="erd-toggle"
              onClick={() => setErdExpanded(!erdExpanded)}
            >
              <span>Schema & Data</span>
              <span className={`erd-toggle-icon ${erdExpanded ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {erdExpanded && (
              <div className="erd-content">
                <div className="schema-tabs">
                  <button
                    className={`schema-tab ${schemaTab === 'schema' ? 'active' : ''}`}
                    onClick={() => setSchemaTab('schema')}
                  >
                    Schema Diagram
                  </button>
                  <button
                    className={`schema-tab ${schemaTab === 'data' ? 'active' : ''}`}
                    onClick={() => setSchemaTab('data')}
                  >
                    Explore Data
                  </button>
                </div>
                {schemaTab === 'schema' && erdSchema && (
                  <ERDDiagram key={schemaVersion} schema={erdSchema} datasetId={currentDataset} />
                )}
                {schemaTab === 'data' && tableNames.length > 0 && (
                  <DataExplorer
                    key={currentDataset}
                    tableNames={tableNames}
                    onQueryTable={handleQueryTable}
                    onCountTable={handleCountTable}
                  />
                )}
              </div>
            )}
          </div>

          <div className="results-section">
            <h2>Results</h2>
            <DataTable
              result={queryResult}
              sql={currentSql}
              onSqlChange={setCurrentSql}
              onRunSql={handleRunSql}
            />
          </div>

          <div className="visualization-section">
            <h2>Visualization</h2>
            <Visualization
              result={queryResult}
              vizConfig={vizConfig}
              onConfigChange={setVizConfig}
              vizScript={vizScript}
              onScriptChange={setVizScript}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
