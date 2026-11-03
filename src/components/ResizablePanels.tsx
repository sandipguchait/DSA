import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useStored } from "../lib/storage";

const MIN = 35;
const MAX = 65;
const clamp = (value: number) => Math.max(MIN, Math.min(MAX, value));

export default function ResizablePanels({ children }: { children: [ReactNode, ReactNode] }) {
  const [split, setSplit] = useStored("dsa-workbench-split", 53);
  const [dragging, setDragging] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const ratio = Number.isFinite(split) ? clamp(split) : 53;

  return (
    <div className="workbench-container mt-5">
      <div
        ref={container}
        className={`workbench${dragging ? " workbench-dragging" : ""}`}
        style={{ "--code-share": `${ratio}fr`, "--viz-share": `${100 - ratio}fr` } as CSSProperties}
      >
        {children[0]}
        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize code and visualization panels"
          aria-orientation="vertical"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={Math.round(ratio)}
          aria-valuetext={`Code ${Math.round(ratio)}%, visualization ${Math.round(100 - ratio)}%`}
          title="Drag to resize · Double-click to reset · Arrow keys to adjust"
          className="workbench-divider"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const bounds = container.current?.getBoundingClientRect();
            if (bounds) setSplit(clamp(((event.clientX - bounds.left - 8) / (bounds.width - 16)) * 100));
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            setDragging(false);
          }}
          onLostPointerCapture={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onDoubleClick={() => setSplit(53)}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            event.stopPropagation();
            const delta = event.shiftKey ? 5 : 1;
            setSplit(event.key === "Home" ? MIN : event.key === "End" ? MAX : clamp(ratio + (event.key === "ArrowRight" ? delta : -delta)));
          }}
        >
          <span />
        </div>
        {children[1]}
      </div>
    </div>
  );
}
