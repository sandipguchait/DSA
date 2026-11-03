import raw from "./problems.json";

export type Level = "Easy" | "Medium" | "Hard";

export type Viz =
  | { t: "arr"; label: string; d: (string | number)[]; c: Record<string, string>; p: Record<string, string>; chain?: boolean; noidx?: boolean }
  | { t: "map"; label: string; d: [string | number, string | number][]; c: Record<string, string> }
  | { t: "stack"; label: string; d: (string | number)[]; c: Record<string, string> }
  | { t: "grid"; label: string; d: (string | number)[][]; c: Record<string, string> }
  | { t: "vars"; d: [string, string | number][]; hi: string[] }
  | { t: "bars"; label: string; d: number[]; w: number[] | null; c: Record<string, string>; p: Record<string, string> }
  | { t: "ivl"; label: string; d: { s: number; e: number; l: string; c?: string }[]; max: number }
  | { t: "pre"; label: string; s: string };

export type Step = [string | string[], string, Viz[]];

export interface Problem {
  id: string;
  name: string;
  freq?: number;
  lvl: Level;
  pat: string;
  idea: string;
  input: string;
  out: string;
  code: string;
  steps: Step[];
  time: string;
  space: string;
  trap: string;
  cat: number;
  catName: string;
  /** 1-based position in the sidebar order (grouped by category) */
  num: number;
}

const data = raw as unknown as {
  CATS: string[];
  CAT: Record<string, number>;
  PROBLEMS: Omit<Problem, "cat" | "catName" | "num">[];
};

export const CATS: string[] = data.CATS;

export const CAT_SHORT = [
  "Arrays",
  "Pointers",
  "Window",
  "Stack",
  "Search",
  "Intervals",
  "Strings",
  "Lists & Trees",
  "Graphs",
  "Heaps",
  "DP",
];

// Ordered the way the sidebar shows them: grouped by category, original order inside each group.
export const PROBLEMS: Problem[] = (() => {
  const out: Problem[] = [];
  let n = 0;
  CATS.forEach((cn, ci) => {
    data.PROBLEMS.filter((p) => data.CAT[p.id] === ci).forEach((p) => {
      out.push({ ...(p as Problem), cat: ci, catName: cn, num: ++n });
    });
  });
  return out;
})();

export const PROBLEM_INDEX: Record<string, number> = Object.fromEntries(PROBLEMS.map((p, i) => [p.id, i]));

export const GROUPS = CATS.map((name, ci) => ({
  name,
  short: CAT_SHORT[ci],
  index: ci,
  items: PROBLEMS.filter((p) => p.cat === ci),
})).filter((g) => g.items.length);
