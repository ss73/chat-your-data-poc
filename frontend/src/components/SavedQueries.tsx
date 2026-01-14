import type { SavedQuery } from '../types';

interface SavedQueriesProps {
  queries: SavedQuery[];
  onSelect: (query: SavedQuery) => void;
  onDelete: (id: string) => void;
  currentQuestion: string;
  currentSql: string;
  onSave: (name: string) => void;
}

export function SavedQueries({
  queries,
  onSelect,
  onDelete,
  currentQuestion,
  currentSql,
  onSave,
}: SavedQueriesProps) {
  const handleSave = () => {
    const name = prompt('Enter a name for this query:');
    if (name?.trim()) {
      onSave(name.trim());
    }
  };

  const canSave = currentQuestion && currentSql;

  return (
    <div className="saved-queries">
      <div className="saved-queries-header">
        <h3>Saved Queries</h3>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="save-btn"
          title={canSave ? 'Save current query' : 'Run a query first'}
        >
          + Save Current
        </button>
      </div>

      {queries.length === 0 ? (
        <p className="no-saved">No saved queries yet</p>
      ) : (
        <ul className="saved-list">
          {queries.map((query) => (
            <li key={query.id} className="saved-item">
              <button
                className="saved-item-btn"
                onClick={() => onSelect(query)}
                title={query.question}
              >
                <span className="saved-name">{query.name}</span>
                <span className="saved-question">{query.question}</span>
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(query.id);
                }}
                title="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
