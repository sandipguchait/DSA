import { useId, useState } from "react";

const cities = ["Amsterdam", "Bengaluru", "Berlin", "Delhi", "Kolkata", "London", "Mumbai", "New York", "Paris", "Pune", "Tokyo"];
export default function Autocomplete() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState("");
  const results = cities.filter(city => city.toLowerCase().includes(query.toLowerCase()));
  function choose(city: string) { setQuery(city); setSelected(city); setOpen(false); setActive(-1); }
  return <div className="mc-stack"><label htmlFor={id}>Choose a city</label>
    <input id={id} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open}
      aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
      value={query} placeholder="Search cities…" onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onChange={e => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
      onKeyDown={e => {
        if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) { e.stopPropagation(); }
        if (e.key === "Escape") setOpen(false);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault(); setOpen(true);
          setActive(i => results.length ? (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : -1);
        }
        if (e.key === "Enter" && open && active >= 0) { e.preventDefault(); choose(results[active]); }
      }} />
    <ul id={`${id}-list`} role="listbox" aria-label="Cities" hidden={!open} className="mc-options">{results.map((city, i) =>
      <li key={city} id={`${id}-option-${i}`} role="option" aria-selected={i === active} onMouseDown={e => e.preventDefault()} onClick={() => choose(city)}>{city}</li>)}
    </ul>
    {open && !results.length && <p role="status">No cities found.</p>}
    <p role="status">{selected ? `Selected: ${selected}` : "Type, then use ↑ / ↓ and Enter."}</p>
  </div>;
}
