import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "../data/problems";
import { fmt, highlight, parseCode } from "../lib/format";
import { cn } from "../utils/cn";
import { ArrowLeft, ArrowRight, Bookmark, Book, Bulb, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Pause, Play, Refresh, Star } from "./Icons";
import { VizCard } from "./Viz";
import ResizablePanels from "./ResizablePanels";

interface Props {
  problem: Problem;
  total: number;
  position: number;
  understood: boolean;
  bookmarked: boolean;
  onToggleUnderstood: () => void;
  onToggleBookmark: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  playToken: number;
}

type Tab = "visualize" | "tests" | "hints" | "solution";
const TABS: { id: Tab; label: string }[] = [
  { id: "visualize", label: "Visualize" },
  { id: "tests", label: "Test Cases" },
  { id: "hints", label: "Hints" },
  { id: "solution", label: "Solution" },
];

const LEVEL_TEXT = { Easy: "text-[var(--easy)]", Medium: "text-[var(--med)]", Hard: "text-[var(--hard)]" } as const;
const LEVEL_PILL = {
  Easy: "border-[var(--easy)]/50 bg-[var(--easy-bg)] text-[var(--easy)]",
  Medium: "border-[var(--med)]/50 bg-[var(--med-bg)] text-[var(--med)]",
  Hard: "border-[var(--hard)]/50 bg-[var(--hard-bg)] text-[var(--hard)]",
} as const;

export default function ProblemView({
  problem: p,
  total,
  position,
  understood,
  bookmarked,
  onToggleUnderstood,
  onToggleBookmark,
  onPrev,
  onNext,
  playToken,
}: Props) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<Tab>("visualize");
  const [hints, setHints] = useState(0);
  const [copied, setCopied] = useState(false);
  const last = p.steps.length - 1;

  const parsed = useMemo(() => parseCode(p.code), [p.code]);
  const st = p.steps[step];
  const on = useMemo(() => {
    const set = new Set<number>();
    const tags = Array.isArray(st[0]) ? st[0] : [st[0]];
    tags.forEach((t) => (parsed.tags[t] || []).forEach((i) => set.add(i)));
    return set;
  }, [st, parsed]);

  // autoplay: advance one step at a time until the trace ends
  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep(step + 1), 1500);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  const go = useCallback((n: number) => setStep(Math.max(0, Math.min(last, n))), [last]);

  const run = useCallback(() => {
    if (playing) return setPlaying(false);
    setTab("visualize");
    if (step >= last) setStep(0);
    setPlaying(true);
  }, [playing, step, last]);

  const reset = () => {
    setPlaying(false);
    setStep(0);
  };

  // external "run" trigger (e.g. keyboard shortcut from the shell)
  const firstToken = useRef(playToken);
  useEffect(() => {
    if (playToken !== firstToken.current) {
      firstToken.current = playToken;
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playToken]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(step + 1);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(step - 1);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [step, go]);

  // keep the active line in view inside the code box only (never scrolls the page)
  const codeBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = codeBox.current;
    if (!box) return;
    const el = box.querySelector<HTMLElement>("[data-on='true']");
    if (el) box.scrollTo({ top: Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2), behavior: "smooth" });
  }, [step, tab]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(parsed.lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  const tryExample = () => {
    setTab("visualize");
    setStep(0);
    setPlaying(true);
  };

  const vizList = st[2];
  const firstCardIdx = vizList.findIndex((v) => v.t !== "vars");

  return (
    <div className="fade-in w-full px-4 pb-10 pt-6 sm:px-6">
      {/* breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-[13px] text-mute">
          <span>Problems</span>
          <ChevronRight size={13} className="text-dim" />
          <span>{p.catName}</span>
          <ChevronRight size={13} className="text-dim" />
          <span className="text-ink">{p.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark problem"}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={cn(
              "grid h-[42px] w-[42px] place-items-center rounded-lg border transition-colors",
              bookmarked ? "border-brand-hi bg-brand-soft text-brand-ink" : "border-line2 bg-panel text-mute hover:text-ink"
            )}
          >
            <Bookmark size={17} filled={bookmarked} />
          </button>
          <button
            onClick={onToggleUnderstood}
            aria-pressed={understood}
            className={cn(
              "flex h-[42px] items-center gap-2.5 rounded-lg px-5 text-[14px] font-semibold text-white transition-colors",
              understood ? "bg-[#17934d] hover:bg-[#1aa656]" : "bg-brand hover:bg-brand-hi"
            )}
          >
            {understood ? "Understood" : "Mark as understood"} <Check size={16} />
          </button>
        </div>
      </div>

      {/* title + stats */}
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[34px] font-bold leading-tight tracking-tight text-ink sm:text-[38px]">{p.name}</h1>
            <span className={cn("rounded-full border px-3 py-[3px] font-mono text-[11.5px] font-semibold uppercase tracking-wider", LEVEL_PILL[p.lvl])}>{p.lvl}</span>
          </div>
          <p className="mt-2.5 max-w-[68ch] text-[15px] leading-relaxed text-mute">{fmt(p.idea)}</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-panel px-1 py-3.5 lg:min-w-[420px]">
          <Stat label="Asked in interviews" value={p.freq ? `~${p.freq}×` : "—"} />
          <Stat label="Trace steps" value={String(p.steps.length)} />
          <Stat label="Difficulty" value={p.lvl} valueClass={LEVEL_TEXT[p.lvl]} />
        </div>
      </div>

      {/* tags */}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Tag>{p.catName}</Tag>
        <Tag>{p.pat}</Tag>
        {p.freq ? (
          <Tag icon={<Book size={13} />}>Asked ~{p.freq}×</Tag>
        ) : null}
        {p.freq && p.freq >= 15 ? (
          <Tag icon={<Star size={13} className="text-amber-400" />}>Popular</Tag>
        ) : null}
      </div>

      {/* input / output */}
      <div className="mt-5 flex flex-wrap items-stretch gap-3">
        <IO label="Input" value={p.input} grow />
        <IO label="Output" value={p.out} />
        <button
          onClick={tryExample}
          className="flex items-center gap-2.5 rounded-xl border border-line2 bg-panel px-4 text-[13px] font-medium text-ink transition-colors hover:border-brand-hi hover:text-brand-ink"
        >
          <Refresh size={15} /> Try example
        </button>
      </div>

      {/* workbench */}
      <ResizablePanels>
        {/* code */}
        <section className="workbench-code flex h-[440px] min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-[var(--code-bg)]" aria-label="Code">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid h-7 w-7 place-items-center rounded-[5px] bg-[#f7df1e] font-sans text-[11px] font-extrabold text-black">JS</span>
            <button className="flex cursor-default items-center gap-2.5 text-[14px] text-[#cfd9ec]" title="JavaScript" tabIndex={-1}>
              JavaScript <ChevronDown size={15} className="text-[#8c9bb5]" />
            </button>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={reset}
                className="flex h-10 items-center gap-2 rounded-lg border border-[#263a5f] bg-[#0f1a31] px-4 text-[13.5px] font-medium text-[#cfd9ec] transition-colors hover:bg-[#15233f]"
              >
                <Refresh size={15} /> Reset
              </button>
              <button
                onClick={() => { setPlaying(false); setTab("visualize"); go(step - 1); }}
                disabled={step === 0}
                aria-label="Previous step"
                title="Previous step"
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#263a5f] bg-[#0f1a31] text-[#cfd9ec] transition-colors enabled:hover:bg-[#15233f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => { setPlaying(false); setTab("visualize"); go(step + 1); }}
                disabled={step === last}
                aria-label="Next step"
                title="Next step"
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#263a5f] bg-[#0f1a31] text-[#cfd9ec] transition-colors enabled:hover:bg-[#15233f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={run}
                className="flex h-10 min-w-[92px] items-center justify-center gap-2.5 rounded-lg bg-brand px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hi"
              >
                {playing ? "Pause" : "Run"} {playing ? <Pause size={13} /> : <Play size={13} />}
              </button>
            </div>
          </div>
          <div className="relative min-h-[300px] flex-1">
            <button
              onClick={copyCode}
              aria-label="Copy code"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md text-[#8c9bb5] hover:bg-white/5 hover:text-white"
            >
              {copied ? <Check size={16} className="text-[#4ade80]" /> : <Copy size={16} />}
            </button>
            <div ref={codeBox} className="absolute inset-0 overflow-auto py-3 font-mono text-[14px] leading-[25px] text-[#d7e2f2]" tabIndex={0}>
              {parsed.lines.map((l, i) => {
                const hot = on.has(i);
                return (
                  <div
                    key={i}
                    data-on={hot}
                    className={cn("flex min-w-max whitespace-pre border-l-[3px] pr-14 transition-colors", hot ? "border-[#e4b422] bg-[rgba(228,180,34,0.17)]" : "border-transparent")}
                  >
                    <span className="w-12 shrink-0 select-none pr-4 text-right text-[#5e6f8c]">{i + 1}</span>
                    <span>{highlight(l)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* right panel */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel" aria-label="Visualization and details">
          <div role="tablist" className="flex items-center gap-1 overflow-x-auto border-b border-line px-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative whitespace-nowrap px-3.5 py-4 text-[14px] font-medium transition-colors",
                  tab === t.id ? "text-brand-ink" : "text-mute hover:text-ink"
                )}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-brand-hi" />}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-4">
            {tab === "visualize" && (
              <>
                {vizList.map((v, i) => (
                  <VizCard key={i} v={v} action={i === firstCardIdx ? reset : undefined} />
                ))}

                <section className="relative overflow-hidden rounded-xl border border-line bg-panel2/70 py-4 pl-6 pr-4">
                  <span className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-b from-brand-hi to-brand-ink/40" />
                  <div className="flex items-center gap-3">
                    <h4 className="text-[14.5px] font-semibold text-ink">Explanation</h4>
                    <span className="ml-auto font-mono text-[12px] text-mute">
                      Step {step + 1} of {p.steps.length}
                    </span>
                    <StepBtn label="Previous step" disabled={step === 0} onClick={() => { setPlaying(false); go(step - 1); }}>
                      <ChevronLeft size={16} />
                    </StepBtn>
                    <StepBtn label="Next step" disabled={step === last} onClick={() => { setPlaying(false); go(step + 1); }}>
                      <ChevronRight size={16} />
                    </StepBtn>
                  </div>
                  <p aria-live="polite" className="mt-3 min-h-[48px] max-w-[62ch] text-[14.5px] leading-[1.7] text-ink/90">
                    {fmt(st[1])}
                  </p>
                  <input
                    type="range"
                    className="scrub mt-3 w-full"
                    min={0}
                    max={last}
                    value={step}
                    onChange={(e) => {
                      setPlaying(false);
                      go(+e.target.value);
                    }}
                    aria-label="Step"
                  />
                </section>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 pt-1 text-[12.5px] text-mute">
                  <Legend color="var(--t-a-bd)">Current line</Legend>
                  <Legend color="var(--t-b-bd)">Compared</Legend>
                  <Legend color="var(--t-g-bd)">Stored / in answer</Legend>
                  <Legend color="var(--t-r-bd)">Dead end</Legend>
                </div>
              </>
            )}

            {tab === "tests" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-panel2/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[14.5px] font-semibold">Example 1</h4>
                    <span className="flex items-center gap-1.5 rounded-full bg-[var(--easy-bg)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--easy)]">
                      <Check size={12} /> TRACED
                    </span>
                  </div>
                  <dl className="space-y-2.5 font-mono text-[13px]">
                    <div>
                      <dt className="mb-1 text-[11px] uppercase tracking-wider text-dim">Input</dt>
                      <dd className="rounded-lg border border-line bg-cell px-3 py-2 text-ink">{p.input}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-[11px] uppercase tracking-wider text-dim">Expected output</dt>
                      <dd className="rounded-lg border border-line bg-cell px-3 py-2 text-ink">{p.out}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-line bg-panel2/70 p-4">
                  <h4 className="mb-3 text-[14.5px] font-semibold">Execution trace</h4>
                  <ol className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
                    {p.steps.map((s, i) => (
                      <li key={i}>
                        <button
                          onClick={() => {
                            setPlaying(false);
                            setStep(i);
                            setTab("visualize");
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-[13px] leading-relaxed transition-colors hover:bg-cell",
                            i === step && "bg-brand-soft"
                          )}
                        >
                          <span className="mt-px w-6 shrink-0 font-mono text-[11.5px] text-dim">{i + 1}</span>
                          <span className="text-mute">{fmt(s[1])}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {tab === "hints" && (
              <div className="space-y-3">
                {[
                  { title: "The idea", body: fmt(p.idea) },
                  { title: "The pattern", body: <>Think <strong className="font-semibold text-ink">{p.pat}</strong>. Aim for <code className="chip-code">{p.time}</code> time and <code className="chip-code">{p.space}</code> space.</> },
                  { title: "Where people slip", body: fmt(p.trap) },
                ].map((h, i) => {
                  const open = i < hints;
                  const canOpen = i === hints;
                  return (
                    <div key={i} className="rounded-xl border border-line bg-panel2/70 p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft font-mono text-[12px] font-semibold text-brand-ink">{i + 1}</span>
                        <h4 className="text-[14.5px] font-semibold">Hint {i + 1} · {h.title}</h4>
                        {canOpen && (
                          <button
                            onClick={() => setHints(i + 1)}
                            className="ml-auto rounded-lg border border-brand-hi/70 bg-brand-soft px-3 py-1.5 text-[12.5px] font-medium text-brand-ink hover:bg-brand/25"
                          >
                            Reveal
                          </button>
                        )}
                        {!open && !canOpen && <span className="ml-auto font-mono text-[11px] text-dim">LOCKED</span>}
                      </div>
                      {open && <p className="fade-in mt-3 text-[14px] leading-relaxed text-mute">{h.body}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "solution" && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-line bg-[var(--code-bg)]">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[12.5px] text-[#8c9bb5]">
                    <span>JavaScript · {p.time} time · {p.space} space</span>
                    <button onClick={copyCode} className="flex items-center gap-1.5 hover:text-white">
                      {copied ? <Check size={14} className="text-[#4ade80]" /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="m-0 max-h-[460px] overflow-auto py-3 font-mono text-[13.5px] leading-[24px] text-[#d7e2f2]">
                    {parsed.lines.map((l, i) => (
                      <div key={i} className="flex min-w-max px-4">
                        <span className="w-8 shrink-0 select-none pr-3 text-right text-[#5e6f8c]">{i + 1}</span>
                        <span>{highlight(l)}</span>
                      </div>
                    ))}
                  </pre>
                </div>
                <div className="rounded-xl border border-line bg-panel2/70 p-4 text-[14px] leading-relaxed text-mute">
                  <h4 className="mb-1.5 text-[14.5px] font-semibold text-ink">Approach</h4>
                  {fmt(p.idea)}
                </div>
              </div>
            )}
          </div>
        </section>
      </ResizablePanels>

      {/* complexity + insight */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-panel p-5">
          <h3 className="text-[15px] font-semibold text-ink">Time &amp; Space Complexity</h3>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-mute">
            <div className="flex items-center gap-3">
              Time <ComplexityChip>{p.time}</ComplexityChip>
            </div>
            <div className="flex items-center gap-3">
              Space <ComplexityChip>{p.space}</ComplexityChip>
            </div>
          </div>
        </section>
        <section className="flex gap-4 rounded-xl border border-line bg-panel p-5">
          <span className="mt-0.5 text-amber-400">
            <Bulb size={22} />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Key Insight</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-mute">{fmt(p.trap)}</p>
          </div>
        </section>
      </div>

      {/* footer nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onPrev ?? undefined}
          disabled={!onPrev}
          className="flex h-[46px] items-center gap-3 rounded-lg border border-line bg-panel px-5 text-[14px] font-medium text-mute transition-colors enabled:hover:border-line2 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Previous problem</span>
          <span className="sm:hidden">Prev</span>
        </button>
        <span className="font-mono text-[13px] tracking-wide text-mute">
          {position} of {total}
        </span>
        <button
          onClick={onNext ?? undefined}
          disabled={!onNext}
          className="flex h-[46px] items-center gap-3 rounded-lg bg-brand px-6 text-[14px] font-semibold text-white transition-colors enabled:hover:bg-brand-hi disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="hidden sm:inline">Next problem</span>
          <span className="sm:hidden">Next</span> <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="px-4 sm:px-5">
      <div className="whitespace-nowrap text-[12.5px] text-mute">{label}</div>
      <div className={cn("mt-1 text-[22px] font-semibold leading-tight text-ink", valueClass)}>{value}</div>
    </div>
  );
}

function Tag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line2 bg-panel px-3.5 py-[6px] text-[13px] text-mute">
      {icon}
      {children}
    </span>
  );
}

function IO({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-xl border border-line bg-panel px-3.5 py-2.5", grow ? "max-w-full flex-1 basis-[300px]" : "")}>
      <span className="text-[14px] text-mute">{label}:</span>
      <code className="min-w-0 break-words rounded-md bg-cell px-3 py-1.5 font-mono text-[13.5px] text-ink">{value}</code>
    </div>
  );
}

function StepBtn({ children, label, disabled, onClick }: { children: React.ReactNode; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-10 place-items-center rounded-lg border border-line2 bg-panel text-ink transition-colors enabled:hover:border-brand-hi enabled:hover:text-brand-ink disabled:cursor-not-allowed disabled:text-dim disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="inline-block h-3 w-3 rounded-[4px]" style={{ background: color }} />
      {children}
    </span>
  );
}

function ComplexityChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-brand-hi/70 bg-brand-soft px-4 py-[7px] font-mono text-[14px] font-medium text-ink">{children}</span>
  );
}
