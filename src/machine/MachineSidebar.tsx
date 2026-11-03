import { useState, type RefObject } from "react";
import { MACHINE_GROUPS, MACHINE_PROBLEMS } from "./problems";
import { Check, SearchIcon } from "../components/Icons";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  completed: string[];
  searchRef: RefObject<HTMLInputElement | null>;
}

export default function MachineSidebar({ selected, onSelect, completed, searchRef }: Props) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const matches = MACHINE_PROBLEMS.filter(p => (level === "All" || p.level === level) && `${p.title} ${p.group} ${p.summary}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="flex h-full min-h-0 flex-col">
    <div className="space-y-4 border-b border-line p-5">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink">Frontend practice</p><h2 className="mt-1 text-lg font-bold">Machine Coding</h2></div><span className="rounded-lg bg-brand-soft px-2.5 py-1 font-mono text-xs text-brand-ink">{MACHINE_PROBLEMS.length}</span></div>
      <label className="flex items-center gap-2 rounded-lg border border-line2 bg-panel px-3 py-2.5 text-mute"><SearchIcon /><input ref={searchRef} aria-label="Search machine coding problems" placeholder="Find an exercise…" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none" /></label>
      <div className="flex flex-wrap gap-1.5">{["All", "Foundation", "Intermediate", "Advanced"].map(value => <button key={value} aria-pressed={level === value} onClick={() => setLevel(value)} className={`rounded-md border px-2 py-1.5 text-[11px] ${level === value ? "border-brand-hi bg-brand-soft text-brand-ink" : "border-line text-mute hover:text-ink"}`}>{value}</button>)}</div>
      <div className="space-y-2"><div className="flex justify-between text-[11px] text-mute"><span>Practice progress</span><span>{completed.filter(id => MACHINE_PROBLEMS.some(p => p.id === id)).length} / {MACHINE_PROBLEMS.length}</span></div><progress aria-label="Machine coding practice progress" max={MACHINE_PROBLEMS.length} value={completed.filter(id => MACHINE_PROBLEMS.some(p => p.id === id)).length} className="h-1.5 w-full accent-brand" /></div>
    </div>
    <nav aria-label="Machine coding exercises" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
      {MACHINE_GROUPS.map(group => {
        const items = matches.filter(p => p.group === group);
        return items.length > 0 && <section key={group} className="mt-5"><h3 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-dim">{group}</h3>
          {items.map(p => <button key={p.id} onClick={() => onSelect(p.id)} aria-current={selected === p.id ? "page" : undefined}
            className={`my-1 flex w-full items-center gap-3 rounded-lg border p-3 text-left ${selected === p.id ? "border-brand/60 bg-brand-soft" : "border-transparent hover:bg-panel2"}`}>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[10px] ${completed.includes(p.id) ? "bg-[var(--easy-bg)] text-[var(--easy)]" : "bg-cell text-mute"}`}>{completed.includes(p.id) ? <Check size={13} /> : String(MACHINE_PROBLEMS.indexOf(p) + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1"><span className={`block text-[13px] font-medium ${selected === p.id ? "text-brand-ink" : "text-ink"}`}>{p.title}</span><span className="mt-0.5 block text-[10px] text-mute">{p.level} · {p.minutes} min</span></span>
          </button>)}
        </section>;
      })}
      {!matches.length && <div className="p-6 text-center text-sm text-mute">No exercises match.<button className="mt-3 block w-full text-brand-ink" onClick={() => { setQuery(""); setLevel("All"); }}>Clear filters</button></div>}
    </nav>
  </div>;
}
