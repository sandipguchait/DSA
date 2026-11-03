import { useCallback, useEffect, useRef, useState } from "react";
import LearningPage from "./components/LearningPage";
import ProblemView from "./components/ProblemView";
import ProgressPage from "./components/ProgressPage";
import ShortcutsModal from "./components/ShortcutsModal";
import Sidebar from "./components/Sidebar";
import ResizableSidebar from "./components/ResizableSidebar";
import TopBar, { type Page } from "./components/TopBar";
import { Close } from "./components/Icons";
import { PROBLEMS, PROBLEM_INDEX } from "./data/problems";
import { useStored, useToggleSet } from "./lib/storage";
import MachineSidebar from "./machine/MachineSidebar";
import MachinePage from "./machine/MachinePage";
import { MACHINE_PROBLEMS, machineProblem } from "./machine/problems";

function routeFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("machine/")) return { page: "machine" as Page, machineId: machineProblem(hash.slice(8))?.id ?? MACHINE_PROBLEMS[0].id };
  return { page: (hash === "learning" || hash === "progress" ? hash : "problems") as Page, machineId: MACHINE_PROBLEMS[0].id };
}

function idFromHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h in PROBLEM_INDEX ? h : PROBLEMS[0].id;
}

export default function App() {
  const [page, setPage] = useState<Page>(() => routeFromHash().page);
  const [machineId, setMachineId] = useState(() => routeFromHash().machineId);
  const [machineCompleted, toggleMachineCompleted, setMachineCompleted] = useToggleSet("dsa-machine-completed");
  const [currentId, setCurrentId] = useState<string>(idFromHash);
  const [theme, setTheme] = useStored<"dark" | "light">("dsa-theme", "dark");
  const [understood, toggleUnderstood, setUnderstood] = useToggleSet("dsa-understood");
  const [bookmarks, toggleBookmark, setBookmarks] = useToggleSet("dsa-bookmarks");
  const [drawer, setDrawer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useStored("dsa-sidebar-collapsed", false);
  const [shortcuts, setShortcuts] = useState(false);
  const [playToken, setPlayToken] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const machineSearchRef = useRef<HTMLInputElement>(null);

  const idx = PROBLEM_INDEX[currentId];
  const problem = PROBLEMS[idx];
  const selectedMachine = machineProblem(machineId) ?? MACHINE_PROBLEMS[0];

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    setDrawer(false);
    window.history.replaceState(null, "", `#${nextPage === "machine" ? `machine/${machineId}` : nextPage === "problems" ? currentId : nextPage}`);
  };

  const openMachine = (id: string) => {
    setMachineId(id);
    setPage("machine");
    setDrawer(false);
    window.history.replaceState(null, "", `#machine/${id}`);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const open = useCallback((id: string) => {
    setCurrentId(id);
    setPage("problems");
    setDrawer(false);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const h = () => {
      const route = routeFromHash();
      setPage(route.page);
      if (route.page === "machine") setMachineId(route.machineId);
      else if (route.page === "problems") setCurrentId(idFromHash());
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [currentId, machineId, page]);

  const prev = idx > 0 ? () => open(PROBLEMS[idx - 1].id) : null;
  const next = idx < PROBLEMS.length - 1 ? () => open(PROBLEMS[idx + 1].id) : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (page !== "machine") navigate("problems");
        if (window.innerWidth < 1024) setDrawer(true);
        else setSidebarCollapsed(false);
        setTimeout(() => (page === "machine" ? machineSearchRef : searchRef).current?.focus(), 60);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") setShortcuts(true);
      else if (page === "problems" && e.key === "]" && next) next();
      else if (page === "problems" && e.key === "[" && prev) prev();
      else if (e.key === " " && page === "problems" && el === document.body) {
        e.preventDefault();
        setPlayToken((t) => t + 1);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  });

  const resetProgress = () => {
    if (window.confirm("Clear all understood marks, bookmarks, and machine coding practice marks stored in this browser?")) {
      setUnderstood([]);
      setBookmarks([]);
      setMachineCompleted([]);
    }
  };

  const sidebar = page === "machine" ? (
    <MachineSidebar selected={machineId} onSelect={openMachine} completed={machineCompleted} searchRef={machineSearchRef} />
  ) : (
    <Sidebar currentId={page === "problems" ? currentId : null} onSelect={open} understood={understood} bookmarks={bookmarks} searchRef={searchRef} />
  );

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <TopBar
        page={page}
        onPage={navigate}
        theme={theme}
        onTheme={setTheme}
        onMenu={() => setDrawer(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
        onShortcuts={() => setShortcuts(true)}
        onResetProgress={resetProgress}
      />

      {/* mobile page switcher (the top bar centre nav is desktop only) */}
      <div className="flex gap-1 overflow-x-auto border-b border-line bg-topbar px-3 py-2 md:hidden">
        {(["problems", "machine", "learning", "progress"] as Page[]).map((p) => (
          <button
            key={p}
            onClick={() => navigate(p)}
            className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-[13px] font-medium capitalize ${page === p ? "bg-brand-soft text-brand-ink" : "text-mute"}`}
          >
            {p === "machine" ? "Machine Coding" : p}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <ResizableSidebar collapsed={sidebarCollapsed}>{sidebar}</ResizableSidebar>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Problem list">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
            <div className="pop absolute inset-y-0 left-0 flex w-[min(400px,92vw)] flex-col border-r border-line bg-bg">
              <button onClick={() => setDrawer(false)} aria-label="Close problem list" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-panel2 hover:text-ink">
                <Close size={18} />
              </button>
              <div className="min-h-0 flex-1 pt-8">{sidebar}</div>
            </div>
          </div>
        )}

        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          {page === "machine" && <MachinePage key={machineId} problem={selectedMachine} completed={machineCompleted.includes(machineId)} onComplete={() => toggleMachineCompleted(machineId)} onSelect={openMachine} />}
          {page === "problems" && (
            <ProblemView
              key={problem.id}
              problem={problem}
              total={PROBLEMS.length}
              position={idx + 1}
              understood={understood.includes(problem.id)}
              bookmarked={bookmarks.includes(problem.id)}
              onToggleUnderstood={() => toggleUnderstood(problem.id)}
              onToggleBookmark={() => toggleBookmark(problem.id)}
              onPrev={prev}
              onNext={next}
              playToken={playToken}
            />
          )}
          {page === "learning" && <LearningPage understood={understood} onOpen={open} />}
          {page === "progress" && <ProgressPage understood={understood} bookmarks={bookmarks} onOpen={open} />}
        </main>
      </div>

      {shortcuts && <ShortcutsModal onClose={() => setShortcuts(false)} />}
    </div>
  );
}
