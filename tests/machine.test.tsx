import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { MACHINE_PROBLEMS } from "../src/machine/problems";
import { getDemo } from "../src/machine/registry";

let intersect: IntersectionObserverCallback;
const disconnect = vi.fn();
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.scrollTo = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function demo(id: string) {
  const { Component } = getDemo(id);
  if (!Component) throw new Error(`Missing demo ${id}`);
  return render(<Component />);
}

describe("exercise coverage", () => {
  it("covers every exercise with a unique source module and specific design notes", () => {
    expect(MACHINE_PROBLEMS).toHaveLength(23);
    expect(new Set(MACHINE_PROBLEMS.map(p => p.id)).size).toBe(23);
    for (const p of MACHINE_PROBLEMS) {
      expect(getDemo(p.id).source).toContain("export default function");
      expect(p.requirements.length).toBeGreaterThanOrEqual(3);
      expect(p.tests.length).toBeGreaterThanOrEqual(4);
    }
  });
  it.each(MACHINE_PROBLEMS.map(p => [p.id]))("mounts the %s preview", id => {
    const { container } = demo(id);
    expect(container.textContent?.length).toBeGreaterThan(10);
  });
});

describe("component behavior", () => {
  it("previews stars without overwriting a committed rating", () => {
    demo("star-rating");
    fireEvent.click(screen.getByRole("button", { name: "Rate 4 out of 5" }));
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Rate 2 out of 5" }));
    expect(screen.getByRole("status").textContent).toBe("4 out of 5 stars");
    fireEvent.click(screen.getByText("Clear rating"));
    expect(screen.getByRole("status").textContent).toBe("0 out of 5 stars");
  });
  it("moves tab selection and focus together with wraparound", () => {
    demo("tabs");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Overview" }), { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Reviews" }).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Reviews" }));
  });
  it("keeps only one accordion item open and allows closing all", () => {
    demo("accordion");
    const trigger = screen.getByRole("button", { name: /Where does state belong/ });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: /What should I build first/ }).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
  it("bounds visible toasts and expires timers", () => {
    vi.useFakeTimers(); demo("toast");
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByText("Show toast"));
    expect(screen.queryByText("Saved change #1")).toBeNull();
    expect(screen.getAllByRole("button", { name: /Dismiss/ })).toHaveLength(3);
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText("Saved change #4")).toBeNull();
  });
  it("selects a local autocomplete match by keyboard and handles no results", () => {
    demo("autocomplete");
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "kol" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("status").textContent).toBe("Selected: Kolkata");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    fireEvent.change(input, { target: { value: "zzzzz" } });
    expect(screen.getByText("No cities found.")).toBeTruthy();
  });
  it("appends infinite-scroll batches and stops at the end", () => {
    demo("infinite-scroll");
    act(() => intersect([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(screen.getByRole("status").textContent).toContain("20 of 50");
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByText("Load more"));
    expect(screen.getByRole("status").textContent).toContain("End of feed");
    expect(screen.queryByText("Load more")).toBeNull();
  });
  it("wraps the carousel in both directions", () => {
    demo("carousel");
    fireEvent.click(screen.getByText("← Previous"));
    expect(screen.getByText("Ocean breeze")).toBeTruthy();
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.getByText("Alpine morning")).toBeTruthy();
  });
  it("posts a nested reply without accepting whitespace-only text", () => {
    demo("comments");
    fireEvent.click(screen.getAllByText("Reply")[0]);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A focused API helps." } });
    fireEvent.click(screen.getByText("Post comment"));
    expect(screen.getByText("A focused API helps.").closest("article")?.parentElement?.closest("article")?.textContent).toContain("What makes a good component API?");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } });
    fireEvent.click(screen.getByText("Post comment"));
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
  it("preserves file selection across folder collapse", () => {
    demo("file-explorer");
    fireEvent.click(screen.getByRole("button", { name: /components/ }));
    fireEvent.click(screen.getByRole("button", { name: /Button.tsx/ }));
    fireEvent.click(screen.getByRole("button", { name: /src/ }));
    expect(screen.getByRole("status").textContent).toContain("src/components/Button.tsx");
    expect(screen.queryByRole("button", { name: /Button.tsx/ })).toBeNull();
  });
  it("never exceeds the queue limit and clears in-flight simulation rows", () => {
    vi.useFakeTimers(); demo("progress-queue");
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByText("Add upload"));
    for (let tick = 0; tick < 35; tick++) {
      act(() => vi.advanceTimersByTime(250));
      const running = screen.getAllByRole("progressbar").filter(bar => bar.parentElement?.textContent?.includes("running"));
      expect(running.length).toBeLessThanOrEqual(2);
    }
    expect(screen.getAllByRole("progressbar").every(bar => bar.getAttribute("value") === "100")).toBe(true);
    fireEvent.click(screen.getByText("Clear queue"));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
  });
  it("measures a stopwatch across pause/resume and resets", () => {
    vi.useFakeTimers(); demo("timer");
    fireEvent.click(screen.getByText("Start"));
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("1.5s");
    fireEvent.click(screen.getByText("Pause"));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("1.5s");
    fireEvent.click(screen.getByText("Start"));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("2.0s");
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByLabelText("Elapsed time").textContent).toBe("0.0s");
  });
  it("resets pagination when the page size changes", () => {
    demo("pagination");
    fireEvent.click(screen.getByRole("button", { name: "Page 8", exact: true }));
    expect(screen.getByText("Practice lesson 37")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "20" } });
    expect(screen.getByRole("status").textContent).toContain("Page 1 of 2");
  });
  it("filters and numerically sorts table rows", () => {
    demo("data-table");
    fireEvent.click(screen.getByRole("button", { name: /score/ }));
    expect(screen.getAllByRole("row")[1].textContent).toContain("Eli");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "engineer" } });
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
  it("reorders tasks using accessible alternatives to dragging", () => {
    demo("drag-list");
    fireEvent.click(screen.getByRole("button", { name: "Move Clarify requirements down" }));
    expect(screen.getAllByRole("listitem")[1].textContent).toContain("Clarify requirements");
  });
  it("moves a kanban card without duplicating it", () => {
    demo("kanban");
    fireEvent.change(screen.getByLabelText("Status for Design component API"), { target: { value: "2" } });
    expect(screen.getByText("Done · 2")).toBeTruthy();
    expect(screen.getByText("Backlog · 0")).toBeTruthy();
    expect(screen.getAllByText("Design component API")).toHaveLength(1);
  });
  it("ends a tic-tac-toe win and rejects further moves", () => {
    demo("tic-tac-toe");
    const cells = screen.getAllByRole("button").slice(0, 9);
    [0, 3, 1, 4, 2].forEach(index => fireEvent.click(cells[index]));
    expect(screen.getByRole("status").textContent).toBe("X wins!");
    expect((cells[8] as HTMLButtonElement).disabled).toBe(true);
  });
  it("drops connect-four tokens with gravity and detects a vertical win", () => {
    demo("connect-four");
    const first = screen.getByRole("button", { name: "Drop into column 1" });
    const second = screen.getByRole("button", { name: "Drop into column 2" });
    for (let i = 0; i < 3; i++) { fireEvent.click(first); fireEvent.click(second); }
    fireEvent.click(first);
    expect(screen.getByRole("status").textContent).toBe("Player 1 wins!");
    expect(screen.getByLabelText("Row 6, column 1: player 1")).toBeTruthy();
  });
  it("cancels traffic-light transitions on stop", () => {
    vi.useFakeTimers(); demo("traffic-light");
    fireEvent.click(screen.getByText("Start"));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole("status").textContent).toContain("Green");
    fireEvent.click(screen.getByText("Stop"));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("status").textContent).toContain("Green");
  });
  it("updates likes immediately and rolls back a rejected request", () => {
    vi.useFakeTimers(); demo("optimistic-like");
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Like/ }));
    expect(screen.getByRole("button").textContent).toContain("25");
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByRole("button").textContent).toContain("24");
    expect(screen.getByRole("status").textContent).toContain("restored");
  });
  it("shows form errors and succeeds only after values become valid", () => {
    demo("form-validation");
    fireEvent.click(screen.getByText("Create account"));
    expect(screen.getByLabelText(/^email/i).getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Asha" } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: "asha@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "practice123" } });
    fireEvent.click(screen.getByText("Create account"));
    expect(screen.getByRole("status").textContent).toContain("Validation passed");
  });
  it("reconciles an unavailable product variant", () => {
    demo("product-swatches");
    fireEvent.click(screen.getByRole("button", { name: "L", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Clay", exact: true }));
    expect(screen.getByRole("button", { name: "M", exact: true }).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("button", { name: "L", exact: true }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("debounces queries, rejects stale results, and caches completed searches", () => {
    vi.useFakeTimers(); demo("typeahead");
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "re" } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(input, { target: { value: "type" } });
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.queryByText("React Router")).toBeNull();
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.change(input, { target: { value: "type" } });
    expect(screen.getByRole("status").textContent).toContain("cache");
  });
});

describe("application integration", () => {
  it("opens a deep link, exposes matching source, and preserves preview state across study tabs", () => {
    window.history.replaceState(null, "", "/#machine/star-rating");
    render(<App />);
    const preview = screen.getByRole("region", { name: "Live React preview" });
    fireEvent.click(within(preview).getByRole("button", { name: "Rate 5 out of 5" }));
    fireEvent.click(screen.getByRole("tab", { name: "Implementation" }));
    expect(screen.getByLabelText("React implementation source").textContent).toContain("function StarRating()");
    expect(within(preview).getByRole("status").textContent).toContain("5 out of 5");
    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(within(preview).getByRole("status").textContent).toContain("3 out of 5");
  });
  it("filters the sidebar, switches exercises, saves progress, and returns to DSA", () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Machine Coding", exact: true })[0]);
    fireEvent.change(screen.getByLabelText("Search machine coding problems"), { target: { value: "kanban" } });
    const sidebar = screen.getByRole("navigation", { name: "Machine coding exercises" });
    fireEvent.click(within(sidebar).getByRole("button", { name: /Kanban board/ }));
    expect(window.location.hash).toBe("#machine/kanban");
    expect(screen.getByRole("heading", { name: "Kanban board", exact: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Mark as practised" }));
    expect(JSON.parse(localStorage.getItem("dsa-machine-completed")!)).toEqual(["kanban"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Problems", exact: true })[0]);
    expect(screen.getByRole("heading", { name: "Two Sum", exact: true })).toBeTruthy();
  });
  it("persists manual checks separately per exercise", () => {
    window.history.replaceState(null, "", "/#machine/tabs");
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Checklist" }));
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(JSON.parse(localStorage.getItem("dsa-machine-checks-tabs")!)).toEqual(["0"]);
  });
});
