import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStored } from "../lib/storage";

const MIN_WIDTH = 280;
const DEFAULT_WIDTH = 400;

export default function ResizableSidebar({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  const [storedWidth, setWidth] = useStored("dsa-sidebar-width", DEFAULT_WIDTH);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, width: DEFAULT_WIDTH });
  // Reserve space for the main view as the window gets narrower.
  const maxWidth = Math.max(MIN_WIDTH, Math.min(600, viewportWidth - 480));
  const clamp = (value: number) => Math.max(MIN_WIDTH, Math.min(maxWidth, value));
  const width = clamp(Number.isFinite(storedWidth) ? storedWidth : DEFAULT_WIDTH);

  useEffect(() => {
    const resize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <aside
      id="problem-sidebar"
      aria-label="Problem list"
      style={{ width }}
      className={`relative hidden shrink-0 border-r border-line bg-bg ${collapsed ? "" : "lg:block"} ${dragging ? "sidebar-resizing" : ""}`}
    >
      {children}
      <div
        role="separator"
        tabIndex={0}
        aria-label="Resize sidebar"
        aria-controls="problem-sidebar"
        aria-orientation="vertical"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={maxWidth}
        aria-valuenow={Math.round(width)}
        aria-valuetext={`${Math.round(width)} pixels`}
        title="Drag to resize sidebar · Double-click to reset · Arrow keys to adjust"
        className="sidebar-divider"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus();
          dragStart.current = { x: event.clientX, width };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          setWidth(clamp(dragStart.current.width + event.clientX - dragStart.current.x));
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onLostPointerCapture={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          event.stopPropagation();
          const delta = event.shiftKey ? 40 : 10;
          setWidth(event.key === "Home" ? MIN_WIDTH : event.key === "End" ? maxWidth : clamp(width + (event.key === "ArrowRight" ? delta : -delta)));
        }}
      >
        <span />
      </div>
    </aside>
  );
}
