# Chat With Your Data - Proof of Concept

## Overview
A web application that allows users to chat with business data using natural language. An LLM translates queries to SQL, executes them on an embedded WASM SQLite database, and can generate visualizations from results.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │
│  │ Chat Input │  │ sql.js     │  │ Results Table          │    │
│  │            │──│ WASM DB    │──│ (react-data-grid)      │    │
│  └────────────┘  └────────────┘  └────────────────────────┘    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │
│  │ Saved      │  │ Plotly.js  │  │ localStorage           │    │
│  │ Queries    │  │ Viz Render │  │ (saved queries)        │    │
│  └────────────┘  └────────────┘  └────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Web Worker Sandbox - Secure visualization scripts       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                        Backend (FastAPI)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │
│  │ /api/data  │  │ /api/query │  │ /api/visualize-script  │    │
│  │ Business   │  │ NL → SQL   │  │ Table → JS Script      │    │
│  │ Data       │  │ via Azure  │  │ via Azure OpenAI       │    │
│  └────────────┘  └────────────┘  └────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Azure OpenAI │
                        │    (GPT-4)   │
                        └──────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + TypeScript | UI framework |
| Frontend | sql.js | WASM SQLite for in-browser queries |
| Frontend | react-data-grid | Spreadsheet-like table display |
| Frontend | Plotly.js | Visualization rendering |
| Frontend | @xyflow/react | ERD diagram visualization |
| Frontend | Web Worker | Secure sandbox for visualization scripts |
| Frontend | localStorage | Persist saved queries and scripts |
| Backend | Python 3.11+ FastAPI | REST API server |
| Backend | openai SDK | Azure OpenAI integration |
| Build | Vite | Fast React bundling |

## Project Structure

```
chat-your-data-poc/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── routes/
│   │   ├── data.py          # Business data endpoint
│   │   ├── query.py         # NL → SQL endpoint
│   │   └── visualize.py     # Generate Plotly code
│   ├── services/
│   │   ├── llm.py           # Azure OpenAI client
│   │   └── sample_data.py   # Sample business data generator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── components/
│   │   │   ├── ChatInput.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── DatasetSelector.tsx
│   │   │   ├── DataExplorer.tsx
│   │   │   ├── ERDDiagram.tsx
│   │   │   ├── Visualization.tsx
│   │   │   └── SavedQueries.tsx
│   │   ├── hooks/
│   │   │   ├── useDatabase.ts    # sql.js initialization
│   │   │   └── useSavedQueries.ts
│   │   ├── services/
│   │   │   └── api.ts        # Backend API calls
│   │   ├── utils/
│   │   │   └── sandbox.ts    # Web Worker sandbox for scripts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Implementation Steps

### Phase 1: Project Setup
1. Create project directory structure
2. Initialize backend with Python virtual environment (`python -m venv venv`)
3. Install FastAPI dependencies in venv, configure CORS
4. Initialize frontend with Vite + React + TypeScript
5. Add sql.js WASM setup with proper vite config

### Phase 2: Backend Core
1. Create `/api/data` endpoint returning sample business data (e.g., sales, customers, products)
2. Create Azure OpenAI client service with proper configuration
3. Create `/api/query` endpoint: accepts natural language, returns SQL query
4. Create `/api/visualize` endpoint: accepts table schema + sample data, returns Plotly code

### Phase 3: Frontend Database Layer
1. Initialize sql.js with WASM binary
2. Create `useDatabase` hook for SQLite operations
3. Fetch business data from backend and populate SQLite tables on app load
4. Implement query execution function

### Phase 4: Chat & Query Interface
1. Build ChatInput component for natural language input
2. Send query to backend, receive SQL
3. Execute SQL on local SQLite, display results
4. Build DataTable component using react-data-grid for spreadsheet view

### Phase 5: Visualization
1. Build Visualization component with Plotly container
2. Create Web Worker sandbox for secure script execution
3. Add "Visualize" button that:
   - Sends table metadata to backend
   - Receives JavaScript code from LLM
   - Executes script in sandbox to generate Plotly config
   - Renders chart with returned config
4. Allow users to edit and re-run visualization scripts
5. Handle visualization errors gracefully

### Phase 6: Save/Load Functionality
1. Create SavedQueries sidebar component
2. Implement save: store {name, question, sql, vizScript} in localStorage
3. Implement load: click saved item → re-run query → execute saved script → render viz
4. Add delete functionality for saved items

### Phase 7: Polish
1. Add loading states and error handling
2. Style with CSS (clean, minimal UI)
3. Add sample queries as suggestions

### Phase 8: Enhanced Features (Implemented)
1. **Multiple Datasets** - Add dataset selector, create HR/Inventory/Support/Security datasets
2. **Schema Explorer** - ERD diagram with React Flow, Data Explorer with table browser
3. **Dark/Light Theme** - Theme toggle with CSS variables, localStorage persistence
4. **Editable SQL** - Allow users to modify generated SQL and re-run
5. **Chart Customization** - Hint input for chart type, custom script editor
6. **Theme-aware Charts** - Plotly charts adapt to light/dark theme

## API Endpoints

### GET /api/datasets
Returns available dataset names and descriptions.
```json
{
  "sales": "E-commerce sales data",
  "hr": "Human resources data",
  "inventory": "Warehouse inventory data",
  "support": "Customer support tickets",
  "security": "Security patrol data"
}
```

### GET /api/data?dataset=sales
Returns business data for the specified dataset to populate the frontend database.
```json
{
  "tables": {
    "sales": {
      "columns": ["id", "date", "product_id", "customer_id", "amount", "quantity"],
      "rows": [...]
    },
    "products": {
      "columns": ["id", "name", "category", "price"],
      "rows": [...]
    },
    "customers": {
      "columns": ["id", "name", "region", "segment"],
      "rows": [...]
    }
  }
}
```

### POST /api/query
Converts natural language to SQL.
```json
// Request
{
  "question": "What are the top 5 products by total sales?",
  "schema": "CREATE TABLE sales(...); CREATE TABLE products(...);"
}

// Response
{
  "sql": "SELECT p.name, SUM(s.amount) as total FROM sales s JOIN products p ON s.product_id = p.id GROUP BY p.name ORDER BY total DESC LIMIT 5"
}
```

### POST /api/visualize-script
Generates JavaScript code that transforms query results into a Plotly configuration. The script runs in a secure browser sandbox.
```json
// Request
{
  "columns": ["product_name", "total_sales"],
  "sampleData": [["Widget A", 15000], ["Widget B", 12000]],
  "userHint": "bar chart" // optional
}

// Response
{
  "script": "const x = rows.map(r => r[0]);\nconst y = rows.map(r => r[1]);\nreturn { data: [{ type: 'bar', x, y }], layout: { title: 'Sales by Product' } };"
}
```

The generated script receives `columns` (string[]) and `rows` (array of arrays) and must return a Plotly config object with `data` and `layout` properties.

## Sample Business Data
The PoC includes 5 sample datasets with realistic generated data:

**Sales Dataset:**
- products: 20 products across 5 categories
- customers: 50 customers across 4 regions
- sales: 500 transactions

**HR Dataset:**
- departments: Company departments with locations
- employees: Employee records with salaries
- performance_reviews: Annual performance reviews

**Inventory Dataset:**
- warehouses: Warehouse locations
- suppliers: Product suppliers
- products: Inventory items with reorder levels
- stock_levels: Current stock per warehouse

**Support Dataset:**
- customers: Support customers with plan tiers
- agents: Support agents by department
- tickets: Support tickets with priorities and resolution times

**Security Dataset:**
- sites: Security patrol sites
- officers: Security officers
- patrol_specifications: Patrol routes with checkpoints
- patrols: Completed patrol records
- patrol_reports: Patrol reports with deviation tracking

## Environment Variables

### Backend (.env)
```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=gpt-4  # or your deployment name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Verification Plan
1. Start backend: `cd backend && source venv/bin/activate && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Verify business data loads into SQLite (check browser console)
4. Test query: "Show me total sales by region"
5. Verify table displays results
6. Click "Visualize" and verify chart renders
7. Save the query with a name
8. Refresh page, click saved query, verify it re-runs correctly

## Key Implementation Notes

### sql.js Setup
sql.js requires loading WASM binary. Use CDN or bundle it:
```typescript
import initSqlJs from 'sql.js';
const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});
```

### Secure Visualization Script Execution
The LLM generates JavaScript code that runs in a Web Worker sandbox. This provides security through isolation:

```typescript
// Sandbox restrictions (in Web Worker)
self.fetch = undefined;
self.importScripts = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
// ... other dangerous APIs removed

// Script execution
const fn = new Function('columns', 'rows', script);
const config = fn(columns, rows);
```

**Security features:**
- No DOM access (Web Workers cannot access `window`, `document`, `alert()`, etc.)
- No network access (`fetch`, `XMLHttpRequest`, `WebSocket` removed)
- No storage access (`indexedDB`, `caches` removed)
- 5-second timeout (kills runaway scripts)
- Runs in isolated blob URL worker

**Script interface:**
- Input: `columns` (string[]), `rows` ((string | number | null)[][])
- Output: `{ data: Plotly.Data[], layout: Partial<Plotly.Layout> }`

### Azure OpenAI Prompts
- **SQL Generation**: Include full schema, emphasize SQLite syntax, ask for SELECT only
- **Visualization Script**: Include column names, sample rows, ask for JavaScript that returns Plotly config
