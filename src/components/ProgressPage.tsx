import { GROUPS, PROBLEMS, type Level } from "../data/problems";
import { cn } from "../utils/cn";
import { ArrowRight, Bookmark, Check } from "./Icons";
import { LevelBadge } from "./Sidebar";

interface Props {
  understood: string[];
  bookmarks: string[];
  onOpen: (id: string) => void;
}

export default function ProgressPage({ understood, bookmarks, onOpen }: Props) {
  const total = PROBLEMS.length;
  const done = PROBLEMS.filter((p) => understood.includes(p.id));
  const pct = Math.round((done.length / total) * 100);
  const next = PROBLEMS.find((p) => !understood.includes(p.id));
  const saved = PROBLEMS.filter((p) => bookmarks.includes(p.id));

  const levels: { l: Level; bar: string }[] = [
    { l: "Easy", bar: "bg-[var(--easy)]" },
    { l: "Medium", bar: "bg-[var(--med)]" },
    { l: "Hard", bar: "bg-[var(--hard)]" },
  ];

  return (
    <div className="fade-in mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-8">
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-brand-ink">Progress</p>
      <h1 className="mt-2 text-[34px] font-bold tracking-tight">Your dry-run progress</h1>
      <p className="mt-3 max-w-[64ch] text-[15px] text-mute">Progress is saved in this browser. Mark a problem as understood once you can predict each step before pressing next.</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-line bg-panel p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[13px] text-mute">Understood</div>
              <div className="mt-1 text-[40px] font-bold leading-none">
                {done.length}
                <span className="text-[22px] font-medium text-mute"> / {total}</span>
              </div>
            </div>
            <div className="font-mono text-[28px] font-semibold text-brand-ink">{pct}%</div>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-cell" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-ink transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {levels.map(({ l, bar }) => {
              const all = PROBLEMS.filter((p) => p.lvl === l);
              const d = all.filter((p) => understood.includes(p.id)).length;
              return (
                <div key={l} className="rounded-lg border border-line bg-panel2/60 p-3">
                  <LevelBadge level={l} className="inline-block" />
                  <div className="mt-2 font-mono text-[18px] font-semibold">
                    {d}
                    <span className="text-[13px] font-normal text-mute"> / {all.length}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cell">
                    <div className={cn("h-full rounded-full", bar)} style={{ width: `${(d / all.length) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-line bg-panel p-6">
          <div className="text-[13px] text-mute">Up next</div>
          {next ? (
            <>
              <h2 className="mt-2 text-[22px] font-semibold leading-tight">{next.name}</h2>
              <div className="mt-2 flex items-center gap-2 text-[12.5px] text-mute">
                <LevelBadge level={next.lvl} /> {next.catName}
              </div>
              <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-mute">{next.idea.replace(/[`*]/g, "")}</p>
              <button
                onClick={() => onOpen(next.id)}
                className="mt-auto flex items-center justify-center gap-2 self-start rounded-lg bg-brand px-5 py-2.5 pt-2.5 text-[14px] font-semibold text-white hover:bg-brand-hi"
              >
                Start tracing <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <p className="mt-3 text-[15px] text-ink">You have understood every problem. Nicely done.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-line bg-panel p-6">
        <h2 className="text-[16px] font-semibold">By topic</h2>
        <div className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {GROUPS.map((g) => {
            const d = g.items.filter((p) => understood.includes(p.id)).length;
            return (
              <div key={g.name}>
                <div className="flex items-baseline justify-between text-[13.5px]">
                  <span>{g.name}</span>
                  <span className="font-mono text-[12px] text-mute">
                    {d}/{g.items.length}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cell">
                  <div className="h-full rounded-full bg-brand-hi transition-all duration-500" style={{ width: `${(d / g.items.length) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <List title="Understood" icon={<Check size={15} className="text-[var(--easy)]" />} items={done} empty="Nothing marked yet. Open a problem and press “Mark as understood”." onOpen={onOpen} />
        <List title="Bookmarked" icon={<Bookmark size={14} filled className="text-brand-ink" />} items={saved} empty="Use the bookmark button on a problem to save it for later." onOpen={onOpen} />
      </div>
    </div>
  );
}

function List({ title, icon, items, empty, onOpen }: { title: string; icon: React.ReactNode; items: typeof PROBLEMS; empty: string; onOpen: (id: string) => void }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-6">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold">
        {icon} {title} <span className="font-mono text-[12px] font-normal text-mute">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-line2 p-4 text-[13px] text-mute">{empty}</p>
      ) : (
        <ul className="mt-3 max-h-[280px] space-y-1 overflow-y-auto pr-1">
          {items.map((p) => (
            <li key={p.id}>
              <button onClick={() => onOpen(p.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] hover:bg-panel2">
                <span className="w-6 font-mono text-[12px] text-dim">{p.num}</span>
                <span className="flex-1">{p.name}</span>
                <LevelBadge level={p.lvl} className="w-[62px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
