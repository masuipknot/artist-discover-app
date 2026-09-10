import { useEffect, useRef, useState } from 'react';
import { searchArtists } from '../api/lastfm.js';

export default function SearchBar({ onSelectArtist }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return undefined;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchArtists(trimmed);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handlePick = (name) => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    onSelectArtist(name);
  };

  return (
    <div className="search-bar">
      {open && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => handlePick(name)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        type="text"
        value={query}
        placeholder="アーティスト名を入力"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
