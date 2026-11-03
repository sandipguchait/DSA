import { useEffect, useRef, useState } from "react";

export default function OptimisticLike() {
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  const [fail, setFail] = useState(false);
  const [message, setMessage] = useState("Local server simulation · 800ms latency");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function toggle() {
    if (pending) return;
    const previous = liked;
    setLiked(!previous); setPending(true); setMessage("Saving…");
    timer.current = setTimeout(() => {
      if (fail) { setLiked(previous); setMessage("Request failed. Previous state restored. Try again."); }
      else setMessage("Saved successfully.");
      setPending(false);
    }, 800);
  }
  return <div className="mc-stack"><h3>A little appreciation</h3><p>The count updates immediately, before the simulated server replies.</p>
    <button aria-pressed={liked} disabled={pending} onClick={toggle}>{liked ? "♥ Liked" : "♡ Like"} · {24 + Number(liked)}</button>
    <label className="mc-row"><input type="checkbox" checked={fail} disabled={pending} onChange={e => setFail(e.target.checked)} />Simulate server failure</label>
    <p role="status">{message}</p>
  </div>;
}
