import { useState } from "react";

type Entry = { name: string; children?: Entry[] };
const files: Entry[] = [{ name: "src", children: [{ name: "components", children: [{ name: "Button.tsx" }, { name: "Tabs.tsx" }] }, { name: "App.tsx" }] }, { name: "public", children: [{ name: "favicon.svg" }] }, { name: "package.json" }];
export default function FileExplorer() {
  const [expanded, setExpanded] = useState<string[]>(["src"]);
  const [selected, setSelected] = useState("src/App.tsx");
  function render(entries: Entry[], parent = ""): React.ReactNode {
    return <ul className="mc-tree">{entries.map(entry => {
      const path = parent ? `${parent}/${entry.name}` : entry.name;
      const open = expanded.includes(path);
      return <li key={path}><button aria-expanded={entry.children ? open : undefined} aria-pressed={!entry.children ? selected === path : undefined}
        onClick={() => entry.children ? setExpanded(items => open ? items.filter(item => item !== path) : [...items, path]) : setSelected(path)}>
        {entry.children ? (open ? "▾ 📂 " : "▸ 📁 ") : "◇ "}{entry.name}</button>
        {entry.children && open && render(entry.children, path)}</li>;
    })}</ul>;
  }
  return <div className="mc-stack"><h3>Project files</h3><nav aria-label="Project file explorer">{render(files)}</nav><p role="status">Selected: <code>{selected}</code></p></div>;
}
