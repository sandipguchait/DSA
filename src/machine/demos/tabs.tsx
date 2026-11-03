import { useId, useRef, useState } from "react";

const items = [
  { title: "Overview", body: "A small, accessible component starts with clear ownership of state." },
  { title: "Details", body: "Arrow keys move between tabs. Home and End jump to the first and last tabs." },
  { title: "Reviews", body: "Only the active panel is mounted in this example." },
];
export default function Tabs() {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="mc-stack">
      <div role="tablist" aria-label="Product information" className="mc-row">
        {items.map((item, i) => <button key={item.title} ref={el => { buttons.current[i] = el; }}
          role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={active === i}
          tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)}
          onKeyDown={e => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
            e.preventDefault(); e.stopPropagation();
            const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : (i + (e.key === "ArrowRight" ? 1 : -1) + 3) % 3;
            setActive(next); buttons.current[next]?.focus();
          }}>{item.title}</button>)}
      </div>
      <div className="mc-card" role="tabpanel" tabIndex={0} id={`${id}-panel-${active}`} aria-labelledby={`${id}-tab-${active}`}>{items[active].body}</div>
    </div>
  );
}
