import { useEffect } from "react";
import { Close } from "./Icons";

const ROWS: [string[], string][] = [
  [["→"], "Next step"],
  [["←"], "Previous step"],
  [["Space"], "Run / pause the trace"],
  [["]"], "Next problem"],
  [["["], "Previous problem"],
  [["⌘", "K"], "Search problems"],
  [["?"], "Show this panel"],
];

export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="pop w-full max-w-[420px] rounded-2xl border border-line2 bg-panel p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold">Keyboard shortcuts</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-panel2 hover:text-ink">
            <Close size={18} />
          </button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {ROWS.map(([keys, label]) => (
            <li key={label} className="flex items-center justify-between py-3 text-[14px]">
              <span className="text-mute">{label}</span>
              <span className="flex gap-1.5">
                {keys.map((k) => (
                  <kbd key={k} className="min-w-[28px] rounded-md border border-line2 bg-cell px-2 py-1 text-center font-mono text-[12px] text-ink">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
