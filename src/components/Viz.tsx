import type { ReactNode } from "react";
import type { Viz } from "../data/problems";
import { cn } from "../utils/cn";
import { Refresh } from "./Icons";

const tone = (c?: string) => (c ? `t-${c}` : "");

function Arr({ v }: { v: Extract<Viz, { t: "arr" }> }) {
  if (!v.d.length) return <Empty />;
  const hasP = Object.keys(v.p).length > 0;
  return (
    <div className="flex w-max min-w-full items-end gap-2">
      {v.d.map((x, i) => (
        <div key={i} className="flex items-end gap-2">
          {v.chain && i > 0 && <span className="mb-[26px] text-dim">→</span>}
          <div className="flex flex-col items-center gap-1">
            {hasP && <div className="h-4 whitespace-nowrap font-mono text-[11px] font-semibold leading-4 text-brand-ink">{v.p[i] || ""}</div>}
            <div className={cn("vcell", tone(v.c[i]))}>{String(x)}</div>
            {!v.noidx && <div className="font-mono text-[11px] text-dim">{i}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MapV({ v }: { v: Extract<Viz, { t: "map" }> }) {
  if (!v.d.length) return <Empty />;
  return (
    <div className="flex flex-wrap gap-2">
      {v.d.map(([k, x], i) => (
        <div key={`${k}-${i}`} className={cn("vkv", tone(v.c[k]))}>
          <span className="k">{String(k)}</span>
          <span className="v">{String(x)}</span>
        </div>
      ))}
    </div>
  );
}

function StackV({ v }: { v: Extract<Viz, { t: "stack" }> }) {
  const n = v.d.length;
  return (
    <div className="vstack">
      {!n && <span className="px-1 py-2 text-center text-[12.5px] italic text-mute">empty</span>}
      {v.d.map((x, i) => (
        <div key={i} className={cn("vcell", tone(v.c[i]), i === n - 1 && "top")}>
          {String(x)}
        </div>
      ))}
    </div>
  );
}

function GridV({ v }: { v: Extract<Viz, { t: "grid" }> }) {
  const C = v.d[0]?.length ?? 0;
  return (
    <table className="vgrid">
      <tbody>
        <tr>
          <th />
          {Array.from({ length: C }, (_, c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
        {v.d.map((row, r) => (
          <tr key={r}>
            <th>{r}</th>
            {row.map((x, c) => (
              <td key={c} className={tone(v.c[`${r},${c}`])}>
                {String(x)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VarsV({ v }: { v: Extract<Viz, { t: "vars" }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {v.d.map(([k, x]) => (
        <span
          key={k}
          className={cn(
            "inline-flex gap-2 rounded-full border px-3 py-[3px] font-mono text-[13px]",
            v.hi.includes(k) ? "border-[var(--t-a-bd)] bg-[var(--t-a-bg)] text-ink" : "border-line2 bg-cell text-ink"
          )}
        >
          <i className="not-italic text-mute">{k}</i>
          {String(x)}
        </span>
      ))}
    </div>
  );
}

function BarsV({ v }: { v: Extract<Viz, { t: "bars" }> }) {
  const w = v.w || [];
  const max = Math.max(1, ...v.d.map((x, i) => x + (w[i] || 0)));
  const U = Math.max(10, Math.min(22, Math.floor(140 / max)));
  return (
    <div className="flex w-max min-w-full items-end gap-2">
      {v.d.map((x, i) => (
        <div key={i} className="flex w-11 flex-col items-center gap-0.5">
          <div className="h-4 whitespace-nowrap font-mono text-[11px] font-semibold leading-4 text-brand-ink">{v.p[i] || ""}</div>
          <div className="flex w-full flex-col-reverse justify-start" style={{ height: max * U }}>
            <div className={cn("vbar", tone(v.c[i]))} style={{ height: x * U }} />
            <div className="vwater" style={{ height: (w[i] || 0) * U }} />
          </div>
          <div className="font-mono text-[12px] font-semibold">{x}</div>
          <div className="font-mono text-[11px] text-dim">{i}</div>
        </div>
      ))}
    </div>
  );
}

function IvlV({ v }: { v: Extract<Viz, { t: "ivl" }> }) {
  const m = v.max;
  const ticks: number[] = [];
  for (let t = 0; t <= m; t += 5) ticks.push(t);
  return (
    <div className="relative pr-14">
      {v.d.map((x, i) => (
        <div key={i} className="relative mb-1 h-[26px]">
          <div className={cn("vivl-bar", tone(x.c))} style={{ left: `${(x.s / m) * 100}%`, width: `${Math.max(((x.e - x.s) / m) * 100, 1)}%` }} />
          <div className="absolute top-1 whitespace-nowrap font-mono text-[12px]" style={{ left: `calc(${(x.e / m) * 100}% + 6px)` }}>
            {x.l}
          </div>
        </div>
      ))}
      <div className="relative h-4 border-t border-line2">
        {ticks.map((t) => (
          <span key={t} className="absolute -translate-x-1/2 font-mono text-[11px] text-dim" style={{ left: `${(t / m) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-lg border border-dashed border-line2 py-2.5 text-center text-[13px] text-mute">(empty)</div>
  );
}

function Body({ v }: { v: Viz }): ReactNode {
  switch (v.t) {
    case "arr":
      return <Scroll><Arr v={v} /></Scroll>;
    case "map":
      return <MapV v={v} />;
    case "stack":
      return <div className="pb-1 pr-16"><StackV v={v} /></div>;
    case "grid":
      return <Scroll><GridV v={v} /></Scroll>;
    case "vars":
      return <VarsV v={v} />;
    case "bars":
      return <Scroll><BarsV v={v} /></Scroll>;
    case "ivl":
      return <IvlV v={v} />;
    case "pre":
      return (
        <pre className="m-0 overflow-x-auto rounded-lg bg-panel2 px-3.5 py-3 font-mono text-[14px] font-medium leading-[1.45] text-ink">{v.s}</pre>
      );
  }
}

function Scroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto pb-1">{children}</div>;
}

function titleOf(v: Viz) {
  if (v.t === "vars") return "Variables";
  return v.label;
}

export function VizCard({ v, action }: { v: Viz; action?: () => void }) {
  return (
    <section className="rounded-xl border border-line bg-panel2/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="min-w-0 text-[14.5px] font-semibold leading-snug text-ink">{titleOf(v)}</h4>
        {action && (
          <button
            onClick={action}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-brand-hi/70 bg-brand-soft px-3 py-[7px] text-[12.5px] font-medium text-brand-ink transition-colors hover:bg-brand/25"
          >
            <Refresh size={14} /> Use example
          </button>
        )}
      </div>
      <Body v={v} />
    </section>
  );
}
