import { useEffect, useRef, useState } from "react";

const technologies = ["React", "React Router", "React Native", "Redux", "TypeScript", "JavaScript", "Next.js", "Node.js", "CSS", "HTML"];
export default function Typeahead() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState("Type at least two characters.");
  const [fail, setFail] = useState(false);
  const cache = useRef(new Map<string, string[]>());
  useEffect(() => {
    const key = query.trim().toLowerCase();
    if (key.length < 2) { setResults([]); setStatus("Type at least two characters."); return; }
    if (!fail && cache.current.has(key)) { setResults(cache.current.get(key)!); setStatus("Results from cache."); return; }
    let cancelled = false;
    let request: ReturnType<typeof setTimeout> | undefined;
    setStatus("Waiting for 300ms of quiet…"); setResults([]);
    const debounce = setTimeout(() => {
      setStatus("Searching local server simulation…");
      request = setTimeout(() => {
        if (cancelled) return;
        if (fail) { setStatus("Search failed. Disable the failure switch to retry."); return; }
        const matches = technologies.filter(item => item.toLowerCase().includes(key));
        cache.current.set(key, matches); setResults(matches); setStatus(matches.length ? `${matches.length} results` : "No results found.");
      }, 500);
    }, 300);
    return () => { cancelled = true; clearTimeout(debounce); clearTimeout(request); };
  }, [query, fail]);
  return <div className="mc-stack"><h3>Find a technology</h3><label>Search<input value={query} placeholder="Try react…" onChange={e => setQuery(e.target.value)} /></label>
    <label className="mc-row"><input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} />Simulate request failure</label>
    <p role="status">{status}</p><ul className="mc-stack">{results.map(result => <li key={result} className="mc-card">{result}</li>)}</ul>
    <p>300ms debounce + 500ms simulated latency. Change the query quickly to test stale-result cancellation.</p>
  </div>;
}
