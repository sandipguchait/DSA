import { GROUPS, PROBLEMS } from "../data/problems";
import { ArrowRight, Check } from "./Icons";
import { LevelBadge } from "./Sidebar";

interface Props {
  understood: string[];
  onOpen: (id: string) => void;
}

const HOW = [
  { n: "1", t: "Read the idea", d: "Every problem opens with the one insight that makes it click, in plain words." },
  { n: "2", t: "Step through the code", d: "Press Run or use the arrow keys. The amber line is the one that just executed." },
  { n: "3", t: "Watch the state", d: "Arrays, maps, stacks, grids and intervals update after each line so nothing stays hidden." },
  { n: "4", t: "Mark it understood", d: "When you can predict the next step before pressing it, tick it off and move on." },
];

export default function LearningPage({ understood, onOpen }: Props) {
  return (
    <div className="fade-in mx-auto w-full max-w-[1100px] px-4 pb-16 pt-8 sm:px-8">
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-brand-ink">Learning</p>
      <h1 className="mt-2 text-[34px] font-bold tracking-tight">Learn by tracing, not memorising</h1>
      <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mute">
        The {PROBLEMS.length} problems are the questions asked most often across companies, grouped by topic with repeats merged into one. Work through a topic top to bottom, or jump to the pattern you want to sharpen.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOW.map((h) => (
          <div key={h.n} className="rounded-xl border border-line bg-panel p-4">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft font-mono text-[12px] font-semibold text-brand-ink">{h.n}</span>
            <h3 className="mt-3 text-[14.5px] font-semibold">{h.t}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{h.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        {GROUPS.map((g) => {
          const done = g.items.filter((p) => understood.includes(p.id)).length;
          return (
            <section key={g.name}>
              <div className="mb-3 flex items-baseline gap-3">
                <h2 className="text-[18px] font-semibold">{g.name}</h2>
                <span className="font-mono text-[12px] text-mute">
                  {done}/{g.items.length} understood
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onOpen(p.id)}
                    className="group flex flex-col rounded-xl border border-line bg-panel p-4 text-left transition-colors hover:border-brand-hi/70 hover:bg-panel2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[14.5px] font-semibold leading-snug">{p.name}</span>
                      <LevelBadge level={p.lvl} className="shrink-0" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-mute">{p.idea.replace(/[`*]/g, "")}</p>
                    <div className="mt-3 flex items-center gap-2 text-[12px] text-dim">
                      <span className="rounded-full border border-line2 px-2.5 py-0.5 text-mute">{p.pat}</span>
                      <span className="font-mono">{p.steps.length} steps</span>
                      {understood.includes(p.id) ? (
                        <Check size={14} className="ml-auto text-[var(--easy)]" />
                      ) : (
                        <ArrowRight size={14} className="ml-auto text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
