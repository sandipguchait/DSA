import { Component, useId, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Refresh } from "../components/Icons";
import ResizablePanels from "../components/ResizablePanels";
import { useStored } from "../lib/storage";
import { MACHINE_PROBLEMS, type MachineProblem } from "./problems";
import { getDemo } from "./registry";
import sharedStyles from "./machine.css?raw";
import "./machine.css";
import CodeViewer from "./CodeViewer";

const SECTIONS = ["Brief", "HLD", "LLD", "Performance", "Implementation", "Checklist"] as const;
type Section = typeof SECTIONS[number];

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert" className="p-6 text-sm text-mute">The preview encountered an error. Use Reset preview to start again.</p> : this.props.children; }
}

export default function MachinePage({ problem: p, completed, onComplete, onSelect }: {
  problem: MachineProblem; completed: boolean; onComplete: () => void; onSelect: (id: string) => void;
}) {
  const [section, setSection] = useState<Section>("Brief");
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [checked, setChecked] = useStored<string[]>(`dsa-machine-checks-${p.id}`, []);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const { Component: Demo, source } = getDemo(p.id);
  const code = showStyles ? sharedStyles : source;
  const index = MACHINE_PROBLEMS.findIndex(item => item.id === p.id);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setCopied(false); }
  }
  return <div className="fade-in w-full p-4 pb-10 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute"><span>Machine Coding <span className="mx-2 text-dim">/</span> {p.group}</span><span className="font-mono">{String(index + 1).padStart(2, "0")} / {MACHINE_PROBLEMS.length} exercises</span></div>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="mc-eyebrow">REACT LAB</span><span className="rounded-full border border-line2 px-2.5 py-1 text-[10px] text-mute">{p.level}</span><span className="text-xs text-mute">{p.minutes}-minute practice</span></div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{p.title}</h1></div>
      <button aria-pressed={completed} onClick={onComplete} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${completed ? "border-[var(--easy)]/40 bg-[var(--easy-bg)] text-[var(--easy)]" : "border-brand/50 bg-brand-soft text-brand-ink"}`}><Check size={15} />{completed ? "Practised" : "Mark as practised"}</button>
    </div>
    <p className="mt-4 max-w-[90ch] text-[15px] leading-relaxed text-mute">{p.summary}</p>
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-panel px-4 py-3 text-xs text-mute"><span className="font-semibold text-ink">Your practice path</span><span>01 Clarify</span><span>02 Design</span><span>03 Build</span><span>04 Test & explain</span></div>

    <ResizablePanels storageKey="dsa-machine-split" leftLabel="Study" rightLabel="Preview">
      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel" aria-label="Machine coding study guide">
        <div role="tablist" aria-label="Study sections" className="flex overflow-x-auto border-b border-line px-2">
          {SECTIONS.map((value, i) => <button key={value} ref={el => { tabs.current[i] = el; }} role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-study`} aria-selected={section === value} tabIndex={section === value ? 0 : -1}
            onClick={() => setSection(value)} onKeyDown={event => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault(); event.stopPropagation();
              const next = event.key === "Home" ? 0 : event.key === "End" ? SECTIONS.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + SECTIONS.length) % SECTIONS.length;
              setSection(SECTIONS[next]); tabs.current[next]?.focus();
            }} className={`shrink-0 border-b-2 px-3 py-4 text-xs font-medium ${section === value ? "border-brand-hi text-brand-ink" : "border-transparent text-mute hover:text-ink"}`}>{value}</button>)}
        </div>
        <div id={`${id}-study`} role="tabpanel" tabIndex={0} aria-labelledby={`${id}-tab-${SECTIONS.indexOf(section)}`} className="mc-study">
          {section === "Brief" && <><Eyebrow>01 / Clarify the contract</Eyebrow><h2>What you’re building</h2><BulletList items={p.requirements} />
            <h3>Timebox your attempt</h3><div className="grid grid-cols-2 gap-3">{[["Clarify", "15%", "Confirm interaction rules and edge cases."], ["Design", "20%", "Sketch component boundaries and state."], ["Implement", "45%", "Build the smallest complete behavior."], ["Verify", "20%", "Test keyboard, empty, and failure paths."]].map(([title, time, description]) => <div className="rounded-lg border border-line bg-panel2 p-3" key={title}><div className="flex justify-between text-xs font-semibold"><span>{title}</span><span className="text-brand-ink">{time}</span></div><p className="mt-2 text-xs leading-relaxed text-mute">{description}</p></div>)}</div>
            <div className="mc-callout"><strong>Try it before reading the code.</strong><p>Use the preview to discover the behavior. Write down the state you need, then compare your plan with HLD and LLD.</p></div>
            <button className="mc-action" onClick={() => setSection("HLD")}>Explore the high-level design →</button>
          </>}
          {section === "HLD" && <><Eyebrow>02 / High-level design</Eyebrow><h2>Boundaries before details</h2><p>For these UI exercises, HLD describes the client-side architecture: who owns data, who handles interactions, and how the view updates.</p>
            <ol className="space-y-3">{p.architecture.map((text, i) => <li key={text} className="flex items-start gap-3 rounded-xl border border-line bg-panel2 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft font-mono text-xs text-brand-ink">0{i + 1}</span><div><h3 className="!mt-0 !text-xs uppercase tracking-wider text-brand-ink">{["Owner / input", "Coordination / state", "Output / feedback"][i]}</h3><p className="!mt-2">{text}</p></div></li>)}</ol>
            <div className="mc-callout"><strong>Data-flow rule</strong><p>Data flows into the rendered controls. Events request a change from the state owner. Derive output from that state instead of synchronizing duplicate copies.</p></div>
            <h3>Scope of this preview</h3><p>All examples run locally in React. Network-like examples use labelled deterministic simulations. Server persistence, authentication, and multi-user synchronization are extension topics.</p>
          </>}
          {section === "LLD" && <><Eyebrow>03 / Low-level design</Eyebrow><h2>State, events & invariants</h2><div className="overflow-x-auto"><table className="mc-state-table"><thead><tr><th>State / model</th><th>Responsibility</th></tr></thead><tbody>{p.state.map(([name, detail]) => <tr key={name}><td><code>{name}</code></td><td>{detail}</td></tr>)}</tbody></table></div><h3>Event transitions</h3><BulletList items={p.events} /><div className="mc-callout"><strong>Explain this in an interview</strong><p>Which values are authoritative, which are derived, and which belong in refs? Walk through one user event and identify exactly what rerenders.</p></div></>}
          {section === "Performance" && <><Eyebrow>04 / Optimize with a reason</Eyebrow><h2>Cost, tradeoffs & scaling</h2><BulletList items={p.performance} /><h3>Next-level challenge</h3><div className="mc-callout"><p>{p.extension}</p></div><h3>What to measure</h3><p>Use React Profiler to check render cost and browser performance tools for layout and long tasks. Measure with a representative dataset before adding memoization or complexity.</p></>}
          {section === "Implementation" && <><div className="flex flex-wrap items-center justify-between gap-3"><div><Eyebrow>05 / Working reference</Eyebrow><h2 className="!mb-0">{showStyles ? "Shared preview styles" : "React + TypeScript"}</h2></div><button className="mc-action" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy code"}</button></div>
            <p>This is the source used by the live preview. Save it as a .tsx component in a React + TypeScript project; include the shared preview CSS for its styling.</p>
            <div className="flex flex-wrap gap-2"><button className="mc-action" aria-pressed={!showStyles} onClick={() => { setShowStyles(false); setCopied(false); }}>Component.tsx</button><button className="mc-action" aria-pressed={showStyles} onClick={() => { setShowStyles(true); setCopied(false); }}>Preview CSS</button></div>
            <CodeViewer key={showStyles ? "styles" : "component"} code={code} label={showStyles ? "Shared preview CSS source" : "React implementation source"} />
          </>}
          {section === "Checklist" && <><Eyebrow>06 / Verify the behavior</Eyebrow><h2>Test your implementation</h2><p>These are manual practice checks. Tick a check after you verify it in the live preview or your own implementation.</p><div className="space-y-3">{p.tests.map((test, i) => <label key={test} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4 text-sm leading-relaxed"><input type="checkbox" className="mt-1 accent-brand" checked={checked.includes(String(i))} onChange={() => setChecked(items => items.includes(String(i)) ? items.filter(item => item !== String(i)) : [...items, String(i)])} /><span>{test}</span></label>)}</div><p className="font-mono text-xs">{p.tests.filter((_, i) => checked.includes(String(i))).length} / {p.tests.length} verified</p><h3>Explain your tradeoff</h3><p>{p.extension}</p></>}
        </div>
      </section>
      <section className="min-w-0 self-start overflow-hidden rounded-xl border border-line bg-panel" aria-label="Live React preview">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-[var(--easy)]" />Live preview</div><button className="mc-action" onClick={() => setRevision(n => n + 1)}><Refresh size={13} />Reset preview</button></div>
        <div className="mc-preview-grid p-4 sm:p-6"><div className="mc-demo"><PreviewBoundary key={`${p.id}-${revision}`}>{Demo ? <Demo /> : <p role="alert">Preview unavailable.</p>}</PreviewBoundary></div></div>
        <div className="border-t border-line px-4 py-3 text-[11px] leading-relaxed text-mute">Interactive React component · Local demo data · Reset clears preview state</div>
        <div className="border-t border-line bg-panel2 p-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-brand-ink">Explore → understand → recreate</p><p className="mt-2 text-xs leading-relaxed text-mute">Try the edge cases in Checklist. Read the implementation after you have sketched your own approach.</p></div>
      </section>
    </ResizablePanels>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button disabled={index === 0} onClick={() => onSelect(MACHINE_PROBLEMS[index - 1].id)} className="mc-action disabled:opacity-40">← Previous exercise</button><span className="text-xs text-mute">Build behavior. Explain decisions.</span><button disabled={index === MACHINE_PROBLEMS.length - 1} onClick={() => onSelect(MACHINE_PROBLEMS[index + 1].id)} className="mc-action disabled:opacity-40">Next exercise →</button></div>
    <footer className="mt-8 border-t border-line pt-4 text-[11px] leading-relaxed text-mute">Reference principles: <a className="text-brand-ink hover:underline" href="https://react.dev/learn/choosing-the-state-structure" target="_blank" rel="noreferrer">React state structure</a> · <a className="text-brand-ink hover:underline" href="https://react.dev/learn/synchronizing-with-effects" target="_blank" rel="noreferrer">Effect cleanup</a> · <a className="text-brand-ink hover:underline" href="https://www.w3.org/WAI/ARIA/apg/patterns/" target="_blank" rel="noreferrer">WAI-ARIA interaction patterns</a></footer>
  </div>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <p className="!mt-0 !text-[10px] font-semibold uppercase tracking-[0.16em] !text-brand-ink">{children}</p>; }
function BulletList({ items }: { items: string[] }) { return <ul className="space-y-3">{items.map((item, i) => <li className="flex items-start gap-3 text-sm leading-relaxed text-mute" key={item}><span className="mt-0.5 shrink-0 font-mono text-[10px] text-brand-ink">{String(i + 1).padStart(2, "0")}</span><span>{item}</span></li>)}</ul>; }
