import { useEffect, useRef, useState } from "react";

export default function InfiniteScroll() {
  const [count, setCount] = useState(10);
  const root = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = count < 50;
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setCount(n => Math.min(50, n + 10));
    }, { root: root.current, rootMargin: "40px" });
    if (sentinel.current && hasMore) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [count, hasMore]);
  return <div className="mc-stack"><h3>Reading feed</h3><p>Local data • 50 items • batches of 10</p>
    <div ref={root} className="mc-feed" tabIndex={0} aria-label="Scrollable article feed">
      {Array.from({ length: count }, (_, i) => <article className="mc-card" key={i}><strong>Article {i + 1}</strong><p>A small lesson in React component design.</p></article>)}
      <div ref={sentinel} />
    </div>
    <p role="status">{count} of 50 loaded{hasMore ? "" : " · End of feed"}</p>
    {hasMore && <button onClick={() => setCount(n => Math.min(50, n + 10))}>Load more</button>}
  </div>;
}
