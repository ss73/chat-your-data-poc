# Chat Your Data

A proof-of-concept web application that lets you query business data using natural language. Ask questions in plain English, get SQL queries, results, and visualizations.

![Architecture](https://img.shields.io/badge/Frontend-React%2019-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![LLM](https://img.shields.io/badge/LLM-Azure%20OpenAI-orange)

## Features

- **Natural Language Queries** - Ask questions like "Show me total sales by region" and get SQL + results
- **In-Browser SQL** - Queries run locally using WASM SQLite (sql.js) - no round-trips for execution
- **Secure Visualizations** - LLM generates JavaScript that runs in a Web Worker sandbox (no DOM/network access)
- **Save & Restore** - Save queries with their visualization scripts to localStorage

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Chat Input   │  │ sql.js WASM  │  │ Results Table        │  │
│  │              │──│ SQLite DB    │──│ (react-data-grid)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Web Worker Sandbox - Executes visualization scripts      │  │
│  │ securely (no DOM, fetch, or network access)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /api/data    │  │ /api/query   │  │/api/visualize-script │  │
│  │ Sample Data  │  │ NL → SQL     │  │ Data → JS Script     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │ Azure OpenAI │
                     │ (GPT-4)      │
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

## Sample Data

The app includes realistic sample business data:
- **Products** - 20 items across 5 categories
- **Customers** - 50 customers across 4 regions
- **Sales** - 500 transactions

## Example Queries

- "Show me total sales by region"
- "What are the top 5 products by revenue?"
- "Which customers have spent the most?"
- "Show monthly sales trend"

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + TypeScript | UI framework |
| Frontend | sql.js | WASM SQLite for in-browser queries |
| Frontend | react-data-grid | Spreadsheet-like table display |
| Frontend | Plotly.js | Visualization rendering |
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
