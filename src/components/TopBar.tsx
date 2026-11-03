import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { ChevronDown, External, Keyboard, Logo, Menu, Moon, SidebarIcon, Sun, Trash } from "./Icons";

export type Page = "problems" | "machine" | "learning" | "progress";

interface Props {
  page: Page;
  onPage: (p: Page) => void;
  theme: "dark" | "light";
  onTheme: (t: "dark" | "light") => void;
  onMenu: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onShortcuts: () => void;
  onResetProgress: () => void;
}

const TABS: { id: Page; label: string }[] = [
  { id: "problems", label: "Problems" },
  { id: "machine", label: "Machine Coding" },
  { id: "learning", label: "Learning" },
  { id: "progress", label: "Progress" },
];

export default function TopBar({ page, onPage, theme, onTheme, onMenu, sidebarCollapsed, onToggleSidebar, onShortcuts, onResetProgress }: Props) {
  const [more, setMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!more) return;
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMore(false);
    };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [more]);

  return (
    <header className="relative z-40 flex h-[58px] shrink-0 items-center gap-3 border-b border-line bg-topbar px-3 sm:px-5">
      <button
        onClick={onMenu}
        aria-label="Open problem list"
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mute hover:text-ink lg:hidden"
      >
        <Menu size={18} />
      </button>

      <button
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!sidebarCollapsed}
        aria-controls="problem-sidebar"
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-mute hover:bg-panel2 hover:text-ink lg:grid"
      >
        <SidebarIcon size={18} />
      </button>

      <button onClick={() => onPage("problems")} className="flex items-center gap-3 rounded-lg" aria-label="DSA Dry Run Lab home">
        <Logo />
        <span className="hidden whitespace-nowrap text-[19px] font-bold tracking-tight text-ink xl:inline">DSA Dry Run Lab</span>
      </button>

      <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
        {TABS.map((t) => {
          const on = page === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPage(t.id)}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors lg:px-4",
                on ? "bg-brand-soft text-brand-ink" : "text-mute hover:bg-panel2 hover:text-ink"
              )}
            >
              {t.label}
              {on && <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-brand-hi" />}
            </button>
          );
        })}
        <div ref={ref} className="relative">
          <button
            onClick={() => setMore((v) => !v)}
            aria-expanded={more}
            aria-haspopup="menu"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-medium text-mute transition-colors hover:bg-panel2 hover:text-ink"
          >
            More <ChevronDown size={15} className={cn("transition-transform", more && "rotate-180")} />
          </button>
          {more && (
            <div role="menu" className="pop absolute left-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-line2 bg-panel p-1.5 shadow-2xl shadow-black/40">
              <MenuItem icon={<Keyboard size={16} />} onClick={() => { setMore(false); onShortcuts(); }}>
                Keyboard shortcuts
              </MenuItem>
              <MenuItem
                icon={<External size={16} />}
                href="https://sandipguchait.github.io/dsa/"
              >
                Original Dry Run Lab
              </MenuItem>
              <div className="my-1 h-px bg-line" />
              <MenuItem
                icon={<Trash size={16} />}
                danger
                onClick={() => {
                  setMore(false);
                  onResetProgress();
                }}
              >
                Reset my progress
              </MenuItem>
            </div>
          )}
        </div>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line2 bg-panel2 p-[3px]" role="group" aria-label="Theme">
          <button
            onClick={() => onTheme("light")}
            aria-label="Light theme"
            aria-pressed={theme === "light"}
            className={cn("grid h-7 w-8 place-items-center rounded-full transition-colors", theme === "light" ? "bg-line2 text-amber-400" : "text-dim hover:text-ink")}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => onTheme("dark")}
            aria-label="Dark theme"
            aria-pressed={theme === "dark"}
            className={cn("grid h-7 w-8 place-items-center rounded-full transition-colors", theme === "dark" ? "bg-line2 text-brand-ink" : "text-dim hover:text-ink")}
          >
            <Moon size={16} />
          </button>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-[14px] font-semibold text-brand-ink ring-1 ring-brand/30" title="Dry Run Lab learner">
          D
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  children,
  icon,
  onClick,
  href,
  danger,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const cls = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors",
    danger ? "text-hard hover:bg-hard-bg" : "text-ink hover:bg-panel2"
  );
  if (href)
    return (
      <a role="menuitem" href={href} target="_blank" rel="noreferrer" className={cls}>
        <span className="text-mute">{icon}</span>
        {children}
      </a>
    );
  return (
    <button role="menuitem" onClick={onClick} className={cls}>
      <span className={danger ? "" : "text-mute"}>{icon}</span>
      {children}
    </button>
  );
}

