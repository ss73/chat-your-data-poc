import type { BusinessData } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchBusinessData(): Promise<BusinessData> {
  const response = await fetch(`${API_BASE}/data`);
  if (!response.ok) {
    throw new Error('Failed to fetch business data');
  }
  return response.json();
}

export async function generateSQL(question: string, schema: string): Promise<string> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, schema }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate SQL');
  }
  const data = await response.json();
  return data.sql;
}

export async function generateVisualization(
  columns: string[],
  sampleData: (string | number | null)[][],
  userHint?: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/visualize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, sampleData, userHint }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate visualization');
  }
  const data = await response.json();
  return data.plotlyCode;
}

export async function generateVisualizationScript(
  columns: string[],
  sampleData: (string | number | null)[][],
  userHint?: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/visualize-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, sampleData, userHint }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate visualization script');
  }
  const data = await response.json();
  return data.script;
}
