import { useEffect, useRef, useState } from 'react';
import { getLocationSuggestions } from '../../api/hotels';
import styles from './HotelsPage.module.css';

interface LocationFilterInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const DEBOUNCE_MS = 300;

export function LocationFilterInput({ value, placeholder, onChange }: LocationFilterInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = value.trim();

    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getLocationSuggestions(trimmed, controller.signal);
        setSuggestions(data.suggestions);
        setIsOpen(data.suggestions.length > 0);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setSuggestions([]);
        setIsOpen(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={styles.locationAutocomplete}>
      <input
        type="text"
        name="location"
        placeholder={placeholder}
        className={styles.searchInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.suggestionsList} role="listbox">
          {suggestions.map((location) => (
            <li key={location} role="option">
              <button
                type="button"
                className={styles.suggestionItem}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(location)}
              >
                {location}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
