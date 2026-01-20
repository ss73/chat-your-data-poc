import type { DatasetsMap } from '../types';

interface DatasetSelectorProps {
  datasets: DatasetsMap;
  selected: string;
  onSelect: (dataset: string) => void;
  disabled?: boolean;
}

export function DatasetSelector({ datasets, selected, onSelect, disabled }: DatasetSelectorProps) {
  return (
    <div className="dataset-selector">
      <label htmlFor="dataset-select">Dataset:</label>
      <select
        id="dataset-select"
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="dataset-select"
      >
        {Object.entries(datasets).map(([key, info]) => (
          <option key={key} value={key}>
            {info.name}
          </option>
        ))}
      </select>
    </div>
  );
}
