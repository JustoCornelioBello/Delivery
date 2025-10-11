// src/components/layout/search/SearchBox.tsx
"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "./useDebounce";
import { useOutsideClick } from "./useOutsideClick";
import { fetchSuggestions, type Suggestion } from "./searchProvider";
import SuggestionList from "./SuggestionList";

export type SearchBoxHandle = { focus: () => void };

type Props = {
  placeholder?: string;
  onSelect?: (query: string) => void; // tú decides: router.push(`/buscar?q=${query}`)
};

const SearchBox = forwardRef<SearchBoxHandle, Props>(({ placeholder, onSelect }, ref) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  useOutsideClick(boxRef, () => setOpen(false));
  const debounced = useDebounce(query, 140);

  // cargar historial
  useEffect(() => {
    const raw = localStorage.getItem("search_recent");
    if (raw) {
      try { setRecent(JSON.parse(raw)); } catch {}
    }
  }, []);

  // fetch sugerencias
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!debounced.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchSuggestions(debounced);
      if (!alive) return;
      setSuggestions(res);
      setLoading(false);
      setOpen(true);
      setActiveIndex(res.length ? 0 : -1);
    })();
    return () => { alive = false; };
  }, [debounced]);

  const showRecent = useMemo(
    () => !query.trim() && recent.length > 0,
    [query, recent.length]
  );

  const commit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    // guardar historial (únicos, 8 max)
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    setRecent(next);
    localStorage.setItem("search_recent", JSON.stringify(next));
    setOpen(false);
    onSelect?.(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    const len = showRecent ? recent.length : suggestions.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, len - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showRecent) commit(recent[activeIndex] ?? query);
      else if (len && activeIndex >= 0) commit((suggestions[activeIndex] as Suggestion).text);
      else commit(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-[560px] max-w-[80vw]">
      {/* input */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="fill-gray-500 dark:fill-gray-400" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3.042 9.374a6.333 6.333 0 1 1 12.666 0A6.333 6.333 0 0 1 3.042 9.374Zm6.333-7.833a7.833 7.833 0 1 0 4.982 13.9l2.82 2.82a.75.75 0 1 0 1.06-1.06l-2.82-2.821A7.833 7.833 0 0 0 9.375 1.541Z" fill="currentColor" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Buscar en Delivery…"}
          aria-label="Buscar"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white/70 pl-12 pr-16 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/5 dark:text-white"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-[11px] text-gray-500 dark:text-gray-400">
          ⌘/Ctrl + K
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <SuggestionList
          query={query}
          loading={loading}
          suggestions={suggestions}
          recent={showRecent ? recent : []}
          activeIndex={activeIndex}
          onHover={(i) => setActiveIndex(i)}
          onSelect={commit}
          onClearRecent={() => { setRecent([]); localStorage.removeItem("search_recent"); }}
        />
      )}
    </div>
  );
});

SearchBox.displayName = "SearchBox";
export default SearchBox;
