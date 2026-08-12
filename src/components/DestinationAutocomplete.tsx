import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Tour } from '../data/tours';

type DestinationTour = Pick<Tour, 'country' | 'resort' | 'departureCity'> & {
  city?: string;
};

type Props = {
  tours: DestinationTour[];
  value: string;
  onChange: (value: string) => void;
};

function addSuggestion(store: Map<string, string>, value?: string) {
  const cleanValue = value?.trim();
  if (cleanValue) store.set(cleanValue.toLocaleLowerCase('ru'), cleanValue);
}

function buildDestinations(tours: DestinationTour[]) {
  const suggestions = new Map<string, string>();

  tours.forEach(({ country, resort, city, departureCity }) => {
    addSuggestion(suggestions, country);
    addSuggestion(suggestions, resort);
    addSuggestion(suggestions, city);
    addSuggestion(suggestions, departureCity);
    addSuggestion(suggestions, `${resort}, ${country}`);
    addSuggestion(suggestions, city && `${city}, ${country}`);
    addSuggestion(suggestions, `${country}, ${resort}`);
    addSuggestion(suggestions, city && `${country}, ${city}`);
    addSuggestion(suggestions, city && resort !== city ? `${resort} / ${city}` : undefined);
  });

  return [...suggestions.values()];
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const start = text.toLocaleLowerCase('ru').indexOf(query.toLocaleLowerCase('ru'));
  if (start < 0) return <>{text}</>;

  return <>
    {text.slice(0, start)}
    <mark className="bg-transparent font-black text-brand">{text.slice(start, start + query.length)}</mark>
    {text.slice(start + query.length)}
  </>;
}

export function DestinationAutocomplete({ tours, value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const allDestinations = useMemo(() => buildDestinations(tours), [tours]);
  const query = value.trim().toLocaleLowerCase('ru');
  const suggestions = useMemo(() => {
    if (!query) return [];

    return allDestinations
      .filter(item => item.toLocaleLowerCase('ru').includes(query))
      .sort((a, b) => {
        const normalizedA = a.toLocaleLowerCase('ru');
        const normalizedB = b.toLocaleLowerCase('ru');
        const score = (item: string) => item.startsWith(query) ? 0 : item.split(/[\s,\/]+/).some(word => word.startsWith(query)) ? 1 : 2;
        return score(normalizedA) - score(normalizedB) || a.length - b.length || a.localeCompare(b, 'ru');
      })
      .slice(0, 6);
  }, [allDestinations, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => { setActiveIndex(-1); }, [value]);

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setIsOpen(false); return; }
    if (!isOpen || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  return <div ref={rootRef} className="relative min-w-0">
    <label htmlFor="destination" className="sr-only">Куда</label>
    <div className="group flex min-h-16 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 transition focus-within:border-brand/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
      <MapPin aria-hidden="true" className="size-5 shrink-0 text-brand"/>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400">Куда</span>
        <input
          id="destination"
          type="text"
          value={value}
          onChange={event => { onChange(event.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Куда хотите поехать?"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls="destination-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `destination-option-${activeIndex}` : undefined}
          className="mt-0.5 w-full bg-transparent text-sm font-bold text-navy outline-none placeholder:font-medium placeholder:text-slate-400"
        />
      </div>
    </div>

    {isOpen && suggestions.length > 0 && <ul id="destination-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
      {suggestions.map((suggestion, index) => <li
        id={`destination-option-${index}`}
        key={suggestion}
        role="option"
        aria-selected={index === activeIndex}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={event => event.preventDefault()}
        onClick={() => selectSuggestion(suggestion)}
        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${index === activeIndex ? 'bg-brand/10 text-brand-dark' : 'text-navy hover:bg-slate-50'}`}
      >
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-sm">📍</span>
        <span className="truncate"><HighlightedText text={suggestion} query={value.trim()}/></span>
      </li>)}
    </ul>}
  </div>;
}
