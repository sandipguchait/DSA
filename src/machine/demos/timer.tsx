import { useEffect, useState } from "react";

export default function Timer() {
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const total = elapsed + (started === null ? 0 : now - started);
  const display = mode === "countdown" ? Math.max(0, 10000 - total) : total;
  useEffect(() => {
    if (started === null) return;
    const timer = setInterval(() => setNow(performance.now()), 50);
    return () => clearInterval(timer);
  }, [started]);
  useEffect(() => {
    if (mode === "countdown" && total >= 10000 && started !== null) { setElapsed(10000); setStarted(null); }
  }, [total, mode, started]);
  function reset() { setElapsed(0); setStarted(null); setNow(0); }
  return <div className="mc-stack"><label>Mode <select value={mode} onChange={e => { reset(); setMode(e.target.value as typeof mode); }}><option value="stopwatch">Stopwatch</option><option value="countdown">10-second countdown</option></select></label>
    <output className="mc-clock" aria-label="Elapsed time">{(display / 1000).toFixed(1)}s</output>
    <div className="mc-row"><button disabled={mode === "countdown" && display === 0} onClick={() => {
      if (started === null) { const time = performance.now(); setNow(time); setStarted(time); }
      else { setElapsed(total); setStarted(null); }
    }}>{started === null ? "Start" : "Pause"}</button><button onClick={reset}>Reset</button></div>
    {mode === "countdown" && display === 0 && <p role="status">Time is up!</p>}
  </div>;
}
