export interface TableData {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface BusinessData {
  tables: {
    [tableName: string]: TableData;
  };
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface SavedQuery {
  id: string;
  name: string;
  question: string;
  sql: string;
  vizScript?: string | null;
}

export interface PlotlyConfig {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
}

export interface DatasetInfo {
  name: string;
  description: string;
}

export interface DatasetsMap {
  [key: string]: DatasetInfo;
}
