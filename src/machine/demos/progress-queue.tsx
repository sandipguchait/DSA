import { useEffect, useRef, useState } from "react";

type Job = { id: number; progress: number; status: "queued" | "running" | "done" };
export default function ProgressQueue() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [limit, setLimit] = useState(2);
  const nextId = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => setJobs(previous => {
      const updated = previous.map(job => job.status === "running" ? { ...job, progress: Math.min(100, job.progress + 10), status: job.progress >= 90 ? "done" as const : "running" as const } : job);
      let slots = limit - updated.filter(job => job.status === "running").length;
      return updated.map(job => { if (job.status === "queued" && slots > 0) { slots--; return { ...job, status: "running" as const }; } return job; });
    }), 250);
    return () => clearInterval(timer);
  }, [limit]);
  return <div className="mc-stack"><h3>Upload scheduler</h3>
    <label>Concurrency <select value={limit} disabled={jobs.some(job => job.status !== "done")} onChange={e => setLimit(+e.target.value)}>{[1, 2, 3].map(n => <option key={n}>{n}</option>)}</select></label>
    <div className="mc-row"><button disabled={jobs.length >= 12} onClick={() => setJobs(items => [...items, { id: ++nextId.current, progress: 0, status: "queued" }])}>Add upload</button><button onClick={() => setJobs([])}>Clear queue</button></div>
    <p role="status">{jobs.filter(job => job.status === "running").length} running · limit {limit}</p>
    {jobs.map(job => <div className="mc-card mc-stack" key={job.id}><label htmlFor={`job-${job.id}`}>File {job.id} · {job.status} · {job.progress}%</label><progress id={`job-${job.id}`} max={100} value={job.progress} /></div>)}
    {!jobs.length && <p>Add uploads to see jobs wait for an available slot.</p>}
  </div>;
}
