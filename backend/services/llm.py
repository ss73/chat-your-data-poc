import os
from openai import AzureOpenAI

client = None


def get_client() -> AzureOpenAI:
    global client
    if client is None:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        )
    return client


def get_deployment_name() -> str:
    return os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")


async def generate_sql(question: str, schema: str) -> str:
    llm = get_client()
    deployment = get_deployment_name()

    system_prompt = f"""You are a SQL query generator. Given a natural language question about business data, generate a valid SQLite SELECT query.

Database schema:
{schema}

Rules:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, etc.)
- Use SQLite syntax
- Return ONLY the SQL query, no explanations or markdown
- Use appropriate JOINs when querying across tables
- Use meaningful column aliases for aggregations
- Boolean values are stored as 0 (false) or 1 (true), not 'yes'/'no' or 'true'/'false'
- Limit results to 100 rows unless specified otherwise"""

    response = llm.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        temperature=0,
        max_tokens=500,
    )

    return response.choices[0].message.content.strip()


async def generate_visualization(columns: list[str], sample_data: list, user_hint: str | None = None) -> dict:
    llm = get_client()
    deployment = get_deployment_name()

    hint_text = f"\nUser preference: {user_hint}" if user_hint else ""

    system_prompt = f"""You are a data visualization expert. Given table column names and sample data, generate a Plotly.js configuration object.

Rules:
- Return ONLY a valid JSON object with "data" and "layout" keys
- The "data" key should contain an array of trace objects
- Choose the most appropriate chart type based on the data
- Use clear titles and axis labels
- Make the visualization informative and easy to read
- Do not include any markdown formatting or explanations{hint_text}

Example output format:
{{"data": [{{"type": "bar", "x": [...], "y": [...], "name": "..."}}], "layout": {{"title": "...", "xaxis": {{"title": "..."}}, "yaxis": {{"title": "..."}}}}}}"""

    user_message = f"""Columns: {columns}
Sample data (first 10 rows): {sample_data[:10]}
Total rows: {len(sample_data)}

Generate a Plotly configuration to visualize this data."""

    response = llm.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()


async def generate_visualization_script(columns: list[str], sample_data: list, user_hint: str | None = None) -> str:
    llm = get_client()
    deployment = get_deployment_name()

    hint_text = f"\nUser preference: {user_hint}" if user_hint else ""

    system_prompt = f"""You are a data visualization expert. Generate JavaScript code that transforms query results into a Plotly.js configuration.

The code will run in a sandbox with these variables available:
- columns: string[] - array of column names
- rows: (string | number | null)[][] - array of data rows

Rules:
- Return ONLY JavaScript code, no markdown formatting or explanations
- The code must return an object with "data" and "layout" keys
- Use the full dataset from 'rows', not just sample data
- Choose the most appropriate chart type based on the data
- Use clear titles and axis labels derived from column names
- Handle data transformation (e.g., grouping, aggregation) in the script
- Use modern JavaScript (const, arrow functions, map/reduce/filter){hint_text}

Example output:
const labels = rows.map(row => row[0]);
const values = rows.map(row => row[1]);

return {{
  data: [{{
    type: 'bar',
    x: labels,
    y: values,
    marker: {{ color: '#667eea' }}
  }}],
  layout: {{
    title: columns[1] + ' by ' + columns[0],
    xaxis: {{ title: columns[0] }},
    yaxis: {{ title: columns[1] }}
  }}
}};"""

    user_message = f"""Columns: {columns}
Sample data (first 10 rows): {sample_data[:10]}
Total rows: {len(sample_data)}

Generate JavaScript code to create a Plotly visualization for this data."""

    response = llm.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3,
        max_tokens=1500,
    )

    return response.choices[0].message.content.strip()
