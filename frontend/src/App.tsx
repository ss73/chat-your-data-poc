import { useEffect, useState, useCallback } from 'react';
import { ChatInput } from './components/ChatInput';
import { DataTable } from './components/DataTable';
import { Visualization } from './components/Visualization';
import { SavedQueries } from './components/SavedQueries';
import { useDatabase } from './hooks/useDatabase';
import { useSavedQueries } from './hooks/useSavedQueries';
import { fetchBusinessData, generateSQL } from './services/api';
import type { QueryResult, PlotlyConfig, SavedQuery } from './types';
import './App.css';

function App() {
  const { initDatabase, executeQuery, isLoading: dbLoading, isReady, schema } = useDatabase();
  const { savedQueries, saveQuery, deleteQuery } = useSavedQueries();

  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentSql, setCurrentSql] = useState('');
  const [vizConfig, setVizConfig] = useState<PlotlyConfig | null>(null);
  const [vizScript, setVizScript] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchBusinessData();
        await initDatabase(data);
      } catch (err) {
        setError('Failed to load business data. Make sure the backend is running.');
        console.error(err);
      }
    }
    loadData();
  }, [initDatabase]);

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
        <h1>Chat Your Data</h1>
        <p className="subtitle">Ask questions about your business data in natural language</p>
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
          />

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
