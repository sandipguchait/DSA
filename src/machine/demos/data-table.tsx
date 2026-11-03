import { useMemo, useState } from "react";

const rows = [
  { id: 1, name: "Asha", role: "Engineer", score: 94 }, { id: 2, name: "Ben", role: "Designer", score: 87 },
  { id: 3, name: "Chen", role: "Engineer", score: 91 }, { id: 4, name: "Diya", role: "Manager", score: 98 },
  { id: 5, name: "Eli", role: "Designer", score: 82 },
];
type Key = "name" | "role" | "score";
export default function DataTable() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: Key; asc: boolean }>({ key: "name", asc: true });
  const visible = useMemo(() => rows.filter(row => `${row.name} ${row.role}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    const left = a[sort.key], right = b[sort.key];
    const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
    return comparison * (sort.asc ? 1 : -1);
  }), [query, sort]);
  return <div className="mc-stack"><label>Filter people <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or role" /></label>
    <div className="mc-overflow"><table><caption>Team performance</caption><thead><tr>{(["name", "role", "score"] as Key[]).map(key => <th key={key} aria-sort={sort.key === key ? (sort.asc ? "ascending" : "descending") : "none"}>
      <button onClick={() => setSort(s => ({ key, asc: s.key === key ? !s.asc : true }))}>{key} {sort.key === key ? (sort.asc ? "↑" : "↓") : "↕"}</button>
    </th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id}><td>{row.name}</td><td>{row.role}</td><td>{row.score}</td></tr>)}</tbody></table></div>
    {!visible.length && <p role="status">No matching people.</p>}<p>{visible.length} results</p>
  </div>;
}
