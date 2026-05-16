import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { CHAMPIONS } from '../data/champions';
import { motion, AnimatePresence } from 'framer-motion';

interface AutocompleteProps {
  onSelect: (name: string) => void;
  disabled?: boolean;
}

export default function Autocomplete({ onSelect, disabled }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredChampions =
    normalizedQuery.length === 0
      ? []
      : [
          ...CHAMPIONS.filter((c) => c.name.toLowerCase().startsWith(normalizedQuery)),
          ...CHAMPIONS.filter(
            (c) =>
              c.name.toLowerCase().includes(normalizedQuery) &&
              !c.name.toLowerCase().startsWith(normalizedQuery)
          ),
        ].slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (filteredChampions.length === 0) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((prev) => Math.min(prev, filteredChampions.length - 1));
  }, [filteredChampions]);

  const submitChampion = (name: string) => {
    onSelect(name);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      if (filteredChampions.length === 0) return;
      event.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev + 1) % filteredChampions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (filteredChampions.length === 0) return;
      event.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev - 1 + filteredChampions.length) % filteredChampions.length);
      return;
    }

    if (filteredChampions.length === 0) return;

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const championToSubmit = filteredChampions[selectedIndex] ?? filteredChampions[0];
      submitChampion(championToSubmit.name);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        id="champion-input"
        className="hex-input w-full"
        placeholder="Tapez le nom d'un champion..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <AnimatePresence>
        {isOpen && query.length > 0 && filteredChampions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-hex-dark-accent border border-hex-gold/30 shadow-2xl overflow-hidden"
          >
            {filteredChampions.map((champ, index) => (
              <li
                key={champ.name}
                className={`px-4 py-2 cursor-pointer text-hex-gold-light border-b border-hex-gold/10 last:border-0 transition-colors ${
                  selectedIndex === index ? 'bg-hex-gold/10' : 'hover:bg-hex-gold/10'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => submitChampion(champ.name)}
              >
                {champ.name}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
