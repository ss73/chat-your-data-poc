# Chat Your Data

A proof-of-concept web application that lets you query business data using natural language. Ask questions in plain English, get SQL queries, results, and visualizations.

![Architecture](https://img.shields.io/badge/Frontend-React%2019-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![LLM](https://img.shields.io/badge/LLM-Azure%20OpenAI-orange)

## Features

- **Natural Language Queries** - Ask questions like "Show me total sales by region" and get SQL + results
- **Multiple Datasets** - Switch between 5 sample datasets: Sales, HR, Inventory, Support, Security
- **In-Browser SQL** - Queries run locally using WASM SQLite (sql.js) - no round-trips for execution
- **Schema Explorer** - Interactive ERD diagram and data browser with pagination
- **Secure Visualizations** - LLM generates JavaScript that runs in a Web Worker sandbox (no DOM/network access)
- **Save & Restore** - Save queries with their visualization scripts to localStorage
- **Dark/Light Theme** - Toggle between themes with automatic persistence
- **Editable SQL** - Modify generated SQL and re-run queries directly

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │
│  │ Chat Input │  │ sql.js     │  │ Results Table          │    │
│  │            │──│ WASM DB    │──│ (react-data-grid)      │    │
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
│  └────────────┘  └────────────┘  └────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Azure OpenAI │
                        └──────────────┘
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Azure OpenAI API access

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure Azure OpenAI credentials
cp .env.example .env
# Edit .env with your Azure OpenAI settings
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Sample Datasets

The app includes 5 realistic sample datasets:

| Dataset | Tables | Description |
|---------|--------|-------------|
| **Sales** | products, customers, sales | E-commerce transactions with 500 sales records |
| **HR** | departments, employees, performance_reviews | Employee data with salaries and reviews |
| **Inventory** | warehouses, suppliers, products, stock_levels | Warehouse stock management |
| **Support** | customers, agents, tickets | Customer support ticket tracking |
| **Security** | sites, officers, patrol_specifications, patrols, patrol_reports | Security patrol management |

## Example Queries

**Sales:**
- "Show me total sales by region"
- "What are the top 5 products by revenue?"

**HR:**
- "Show average salary by department"
- "Which employees have the highest performance scores?"

**Inventory:**
- "Which products are below reorder level?"
- "Show total stock by warehouse"

**Support:**
- "Show ticket count by priority"
- "What is the average resolution time by category?"

**Security:**
- "How many patrols had deviations last month?"
- "Which sites have the most checkpoints?"

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + TypeScript | UI framework |
| Frontend | sql.js | WASM SQLite for in-browser queries |
| Frontend | react-data-grid | Spreadsheet-like table display |
| Frontend | Plotly.js | Visualization rendering |
| Frontend | @xyflow/react | ERD diagram visualization |
| Frontend | Web Worker | Secure sandbox for scripts |
| Backend | FastAPI | REST API server |
| Backend | Azure OpenAI SDK | LLM integration |

## Security

Visualization scripts run in a Web Worker sandbox with:
- No DOM access (`window`, `document`, `alert` unavailable)
- No network access (`fetch`, `XMLHttpRequest`, `WebSocket` disabled)
- No storage access (`indexedDB`, `caches` disabled)
- 5-second execution timeout

## Environment Variables

Create `backend/.env` with:

```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## License

MIT
