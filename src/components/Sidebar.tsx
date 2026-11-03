import { useEffect, useMemo, useRef, useState } from "react";
import { CAT_SHORT, CATS, GROUPS, PROBLEMS, type Level, type Problem } from "../data/problems";
import { cn } from "../utils/cn";
import { Bookmark, Check, SearchIcon } from "./Icons";

export type Filter = "all" | "bookmarked" | `cat:${number}` | `lvl:${Level}`;

interface Props {
  currentId: string | null;
  onSelect: (id: string) => void;
  understood: string[];
  bookmarks: string[];
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export const LEVEL_STYLE: Record<Level, string> = {
  Easy: "bg-[var(--easy-bg)] text-[var(--easy)]",
  Medium: "bg-[var(--med-bg)] text-[var(--med)]",
  Hard: "bg-[var(--hard-bg)] text-[var(--hard)]",
};

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-[5px] px-2 py-[3px] text-center font-mono text-[10.5px] font-bold uppercase leading-none tracking-[0.06em]",
        LEVEL_STYLE[level],
        className
      )}
    >
      {level}
    </span>
  );
}

const QUICK: Filter[] = ["all", "cat:0", "cat:1", "cat:2"];

function filterLabel(f: Filter) {
  if (f === "all") return "All";
  if (f === "bookmarked") return "Saved";
  if (f.startsWith("cat:")) return CAT_SHORT[+f.slice(4)];
  return f.slice(4);
}

export default function Sidebar({ currentId, onSelect, understood, bookmarks, searchRef }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!more) return;
    const h = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMore(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [more]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  const match = (p: Problem) => {
    const s = q.trim().toLowerCase();
    if (s && !(p.name.toLowerCase().includes(s) || p.pat.toLowerCase().includes(s) || p.catName.toLowerCase().includes(s) || p.lvl.toLowerCase() === s))
      return false;
    if (filter === "all") return true;
    if (filter === "bookmarked") return bookmarks.includes(p.id);
    if (filter.startsWith("cat:")) return p.cat === +filter.slice(4);
    return p.lvl === filter.slice(4);
  };

  const groups = useMemo(
    () => GROUPS.map((g) => ({ ...g, shown: g.items.filter(match) })).filter((g) => g.shown.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, filter, bookmarks]
  );
  const total = groups.reduce((a, g) => a + g.shown.length, 0);

  const chips: Filter[] = QUICK.includes(filter) ? QUICK : ["all", filter, ...QUICK.slice(1)];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3.5 px-5 pb-3 pt-5">
        <label className="flex h-[46px] items-center gap-3 rounded-xl border border-line2 bg-panel px-3.5 text-mute focus-within:border-brand-hi focus-within:ring-2 focus-within:ring-brand/30">
          <SearchIcon size={18} />
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems..."
            aria-label="Search problems"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-mute"
          />
          {q ? (
            <button onClick={() => setQ("")} className="text-[12px] text-dim hover:text-ink" aria-label="Clear search">
              Clear
            </button>
          ) : (
            <kbd className="rounded-md border border-line2 bg-panel2 px-2 py-[3px] font-mono text-[11px] text-mute">⌘ K</kbd>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "rounded-lg border px-3.5 py-[6px] text-[13px] font-medium transition-colors",
                filter === c
                  ? "border-brand-hi bg-brand-soft text-brand-ink"
                  : "border-line2 bg-panel text-mute hover:border-dim hover:text-ink"
              )}
            >
              {filterLabel(c)}
            </button>
          ))}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMore((v) => !v)}
              aria-label="More filters"
              aria-expanded={more}
              className="grid h-[33px] w-[44px] place-items-center rounded-lg border border-line2 bg-panel text-mute hover:text-ink"
            >
              <span className="-mt-1 text-[18px] leading-none tracking-widest">···</span>
            </button>
            {more && (
              <div className="pop absolute left-0 top-full z-30 mt-2 max-h-[60vh] w-56 overflow-y-auto rounded-xl border border-line2 bg-panel p-2 shadow-2xl shadow-black/40">
                <FilterGroup title="Difficulty">
                  {(["Easy", "Medium", "Hard"] as Level[]).map((l) => (
                    <FilterItem key={l} on={filter === `lvl:${l}`} onClick={() => { setFilter(`lvl:${l}`); setMore(false); }}>
                      {l}
                    </FilterItem>
                  ))}
                </FilterGroup>
                <FilterGroup title="Topic">
                  {CATS.map((c, i) => (
                    <FilterItem key={c} on={filter === `cat:${i}`} onClick={() => { setFilter(`cat:${i}`); setMore(false); }}>
                      {c}
                    </FilterItem>
                  ))}
                </FilterGroup>
                <FilterGroup title="Yours">
                  <FilterItem on={filter === "bookmarked"} onClick={() => { setFilter("bookmarked"); setMore(false); }}>
                    Bookmarked
                  </FilterItem>
                </FilterGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-1" role="list" aria-label="Problems">
        {total === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-line2 p-6 text-center text-[13px] text-mute">
            No problems match <span className="font-mono text-ink">{q || filterLabel(filter)}</span>.
            <button
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
              className="mt-3 block w-full text-brand-ink hover:underline"
            >
              Clear search and filters
            </button>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.name} className="mb-5">
            <h3 className="mb-2.5 mt-4 flex items-center gap-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.2em] text-mute">
              {g.name}
              <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-cell px-1.5 text-[11px] tracking-normal text-ink">
                {g.shown.length}
              </span>
            </h3>
            <div className="rounded-xl border border-line bg-panel/60">
              {g.shown.map((p, i) => {
                const active = p.id === currentId;
                const done = understood.includes(p.id);
                return (
                  <button
                    key={p.id}
                    ref={active ? activeRef : undefined}
                    role="listitem"
                    onClick={() => onSelect(p.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 px-3.5 py-[9px] text-left transition-colors first:rounded-t-[11px] last:rounded-b-[11px]",
                      i > 0 && !active && "border-t border-line/70",
                      active
                        ? "relative z-10 -my-px rounded-lg border border-brand-hi bg-gradient-to-r from-brand/45 to-brand/20 shadow-[0_0_0_1px_rgba(43,120,255,0.5),0_0_22px_rgba(21,101,245,0.35)]"
                        : "hover:bg-panel2"
                    )}
                  >
                    <span className={cn("grid w-5 shrink-0 place-items-center font-mono text-[12.5px]", active ? "text-ink" : "text-mute")}>
                      {done ? <Check size={14} className="text-[var(--easy)]" /> : p.num}
                    </span>
                    <span className={cn("min-w-0 flex-1 text-[14px] leading-snug", active ? "font-medium text-white" : "text-ink")}>{p.name}</span>
                    {bookmarks.includes(p.id) && <Bookmark size={12} filled className="shrink-0 text-brand-ink" />}
                    <LevelBadge level={p.lvl} className="w-[62px] shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {total > 0 && (
          <p className="pb-2 text-center font-mono text-[11px] text-dim">
            {total} of {PROBLEMS.length} problems
          </p>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5">
      <div className="px-2 pb-1 pt-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{title}</div>
      {children}
    </div>
  );
}
function FilterItem({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px]", on ? "bg-brand-soft text-brand-ink" : "text-ink hover:bg-panel2")}
    >
      {children}
      {on && <Check size={14} />}
    </button>
  );
}
