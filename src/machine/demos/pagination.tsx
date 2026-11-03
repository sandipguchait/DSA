import { useState } from "react";

const items = Array.from({ length: 37 }, (_, i) => `Practice lesson ${i + 1}`);
export default function Pagination() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const pages = Math.ceil(items.length / size);
  return <div className="mc-stack"><label>Rows per page <select value={size} onChange={e => { setSize(+e.target.value); setPage(1); }}>{[5, 10, 20].map(n => <option key={n}>{n}</option>)}</select></label>
    <ul className="mc-stack">{items.slice((page - 1) * size, page * size).map(item => <li className="mc-card" key={item}>{item}</li>)}</ul>
    <nav className="mc-row" aria-label="Lesson pages"><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
      {Array.from({ length: pages }, (_, i) => <button key={i} aria-label={`Page ${i + 1}`} aria-current={page === i + 1 ? "page" : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
      <button disabled={page === pages} onClick={() => setPage(p => p + 1)} aria-label="Next page">→</button></nav>
    <p role="status">Page {page} of {pages} · {items.length} lessons</p>
  </div>;
}
