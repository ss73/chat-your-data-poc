import { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import type { QueryResult, PlotlyConfig } from '../types';
import { runInSandbox } from '../utils/sandbox';
import { generateVisualizationScript } from '../services/api';

const DEFAULT_SCRIPT = `// Available: columns (string[]), rows (array of arrays)
// Return a Plotly config object with 'data' and 'layout'

const x = rows.map(row => row[0]);
const y = rows.map(row => row[1]);

return {
  data: [{
    x,
    y,
    type: 'bar'
  }],
  layout: {
    title: columns.join(' vs ')
  }
};`;

interface VisualizationProps {
  result: QueryResult | null;
  vizConfig: PlotlyConfig | null;
  onConfigChange: (config: PlotlyConfig) => void;
  vizScript: string | null;
  onScriptChange: (script: string | null) => void;
}

export function Visualization({
  result,
  vizConfig,
  onConfigChange,
  vizScript,
  onScriptChange,
}: VisualizationProps) {
  const [hint, setHint] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [configText, setConfigText] = useState('');
  const [scriptText, setScriptText] = useState(DEFAULT_SCRIPT);
  const [parseError, setParseError] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const lastAutoRunScript = useRef<string | null>(null);

  useEffect(() => {
    if (vizConfig) {
      setConfigText(JSON.stringify(vizConfig, null, 2));
      setParseError(null);
    }
  }, [vizConfig]);

  // Reset state when result changes (new query)
  useEffect(() => {
    setHint('');
    setScriptError(null);
  }, [result]);

  // Sync script from prop (when loading saved query)
  useEffect(() => {
    if (vizScript) {
      setScriptText(vizScript);
    } else {
      // Reset when script is cleared (new query)
      lastAutoRunScript.current = null;
    }
  }, [vizScript]);

  // Auto-run script when loaded from saved query
  useEffect(() => {
    // Only auto-run if we have a script, result, no config yet, and haven't run this script
    if (vizScript && result && !vizConfig && lastAutoRunScript.current !== vizScript) {
      lastAutoRunScript.current = vizScript;
      setScriptError(null);
      runInSandbox(vizScript, result.columns, result.rows).then((sandboxResult) => {
        if (sandboxResult.success && sandboxResult.result) {
          const config = sandboxResult.result as PlotlyConfig;
          if (config.data && config.layout) {
            onConfigChange(config);
          } else {
            setScriptError('Saved script returned invalid config');
          }
        } else {
          setScriptError(sandboxResult.error || 'Failed to run saved script');
        }
      });
    }
  }, [vizScript, result, vizConfig, onConfigChange]);

  const canVisualize = result && result.rows.length > 0;

  const handleVisualize = async () => {
    if (!result) return;

    setIsGeneratingScript(true);
    setScriptError(null);

    try {
      const script = await generateVisualizationScript(
        result.columns,
        result.rows,
        hint || undefined
      );
      const cleanedScript = script
        .replace(/^```(?:javascript|js)?\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();

      setScriptText(cleanedScript);
      onScriptChange(cleanedScript);

      // Run the generated script
      const sandboxResult = await runInSandbox(cleanedScript, result.columns, result.rows);
      if (sandboxResult.success && sandboxResult.result) {
        const config = sandboxResult.result as PlotlyConfig;
        if (config.data && config.layout) {
          onConfigChange(config);
        } else {
          setScriptError('Script must return an object with "data" and "layout" properties');
        }
      } else {
        setScriptError(sandboxResult.error || 'Script execution failed');
      }
    } catch (e) {
      setScriptError(e instanceof Error ? e.message : 'Failed to generate visualization');
    }

    setIsGeneratingScript(false);
  };

  const handleApplyConfig = () => {
    try {
      const parsed = JSON.parse(configText) as PlotlyConfig;
      onConfigChange(parsed);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleRunScript = async () => {
    if (!result) return;

    setIsRunningScript(true);
    setScriptError(null);

    const sandboxResult = await runInSandbox(scriptText, result.columns, result.rows);

    if (sandboxResult.success && sandboxResult.result) {
      try {
        const config = sandboxResult.result as PlotlyConfig;
        if (!config.data || !config.layout) {
          throw new Error('Script must return an object with "data" and "layout" properties');
        }
        onScriptChange(scriptText);
        onConfigChange(config);
      } catch (e) {
        setScriptError(e instanceof Error ? e.message : 'Invalid config returned');
      }
    } else {
      setScriptError(sandboxResult.error || 'Script execution failed');
    }

    setIsRunningScript(false);
  };

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canVisualize && !isGeneratingScript) {
              handleVisualize();
            }
          }}
          placeholder="Chart type hint (optional, e.g., 'bar chart', 'line graph')"
          className="viz-hint-input"
          disabled={!canVisualize || isGeneratingScript}
        />
        <button
          onClick={handleVisualize}
          disabled={!canVisualize || isGeneratingScript}
          className="viz-generate-btn"
        >
          {isGeneratingScript ? 'Generating...' : 'Visualize'}
        </button>
      </div>

      {scriptError && <div className="viz-error">{scriptError}</div>}

      {vizConfig && (
        <>
          <div className="viz-plot">
            <Plot
              data={vizConfig.data}
              layout={{
                ...vizConfig.layout,
                autosize: true,
                height: Math.min(Math.max(vizConfig.layout.height ?? 400, 200), 800),
              }}
              useResizeHandler
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>

          <div className="viz-config-section">
            <button
              className="viz-config-toggle"
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? '▼' : '▶'} Edit current presentation (not saved)
            </button>

            {showEditor && (
              <div className="viz-config-editor">
                <textarea
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  className="viz-config-textarea"
                  spellCheck={false}
                />
                {parseError && <div className="viz-config-error">{parseError}</div>}
                <button
                  className="viz-config-apply"
                  onClick={handleApplyConfig}
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {canVisualize && (
        <div className="viz-script-section">
          <button
            className="viz-config-toggle"
            onClick={() => setShowScript(!showScript)}
          >
            {showScript ? '▼' : '▶'} Custom Script
          </button>

          {showScript && (
            <div className="viz-script-editor">
              <p className="viz-script-hint">
                Edit the JavaScript that transforms query results into a Plotly config.
                Runs in a secure sandbox (no DOM, fetch, or network access).
              </p>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="viz-config-textarea viz-script-textarea"
                spellCheck={false}
              />
              <button
                className="viz-config-apply"
                onClick={handleRunScript}
                disabled={isRunningScript}
              >
                {isRunningScript ? 'Running...' : 'Run Script'}
              </button>
            </div>
          )}
        </div>
      )}

      {!vizConfig && !isGeneratingScript && (
        <div className="viz-placeholder">
          <p>Run a query and click "Visualize" to generate a chart</p>
        </div>
      )}
    </div>
  );
}
