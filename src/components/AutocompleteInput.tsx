import React from 'react';

interface AutocompleteInputProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: any[];
  loading: boolean;
  iconClass?: string;
  onSelectSuggestion?: (feature: any) => void;
  selected?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  suggestions,
  loading,
  iconClass = "fas fa-map-marker-alt",
  onSelectSuggestion,
  selected = false
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <i className={`${iconClass} absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none`}></i>
      {!selected && loading && value.length > 3 && (
        <div className="absolute left-0 right-0 bg-white border rounded shadow p-2 mt-1 z-10">
          <span>Chargement...</span>
        </div>
      )}
      {!selected && suggestions.length > 0 && value.length > 3 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow p-2 mt-1 z-10">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1"
              onClick={() => onSelectSuggestion && onSelectSuggestion(s)}
            >
              {s.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default AutocompleteInput;