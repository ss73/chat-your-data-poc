import { useState, type FormEvent } from 'react';

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading && !disabled) {
      onSubmit(question.trim());
    }
  };

  const suggestions = [
    'Show me total sales by region',
    'What are the top 5 products by revenue?',
    'Which customers have spent the most?',
    'Show monthly sales trend',
  ];

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your data..."
          disabled={isLoading || disabled}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading || disabled || !question.trim()}
          className="chat-submit"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      <div className="suggestions">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuestion(suggestion)}
            className="suggestion-chip"
            disabled={isLoading || disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
