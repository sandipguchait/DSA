import type { ReactNode } from "react";

/** Inline formatter: **bold** and `code` */
export function fmt(s: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`(.+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<strong key={k++} className="font-semibold text-ink">{m[1]}</strong>);
    else parts.push(<code key={k++} className="chip-code">{m[2]}</code>);
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

const RE =
  /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b(?:function|const|let|var|return|if|else|for|while|of|in|new|class|continue|break|constructor|this|true|false|null|undefined|throw|typeof)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*(?=\())/g;

const CLS = ["text-[#6f819c] italic", "text-[#8be0a4]", "text-[#5ba3ff]", "text-[#f2a65e]", "text-[#f1cd5f]"];

export function highlight(line: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  line.replace(RE, (...args) => {
    const m = args[0] as string;
    const off = args[args.length - 2] as number;
    if (off > last) out.push(line.slice(last, off));
    const idx = [1, 2, 3, 4, 5].findIndex((i) => args[i] !== undefined);
    out.push(
      <span key={k++} className={CLS[idx]}>
        {m}
      </span>
    );
    last = off + m.length;
    return m;
  });
  if (last < line.length) out.push(line.slice(last));
  return out.length ? out : " ";
}

/** Split code into display lines, pulling out the //@tag markers that map steps to lines. */
export function parseCode(code: string) {
  const tags: Record<string, number[]> = {};
  const lines = code.split("\n").map((ln, i) => {
    const m = ln.match(/\s*\/\/@(\w+)\s*$/);
    if (m && m.index !== undefined) {
      (tags[m[1]] = tags[m[1]] || []).push(i);
      return ln.slice(0, m.index);
    }
    return ln;
  });
  return { lines, tags };
}
