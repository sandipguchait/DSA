import { useEffect, useRef, useState } from "react";

type Toast = { id: number; message: string };
export default function ToastSystem() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const sequence = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  useEffect(() => { const current = timers.current; return () => { current.forEach(clearTimeout); }; }, []);
  function dismiss(id: number) {
    clearTimeout(timers.current.get(id)); timers.current.delete(id);
    setToasts(items => items.filter(item => item.id !== id));
  }
  function add() {
    const id = ++sequence.current;
    setToasts(items => [...items, { id, message: `Saved change #${id}` }].slice(-3));
    timers.current.set(id, setTimeout(() => dismiss(id), 4000));
  }
  return <div className="mc-stack"><h3>Notification center</h3><p>Up to three visible toasts. Each expires after four seconds.</p>
    <button onClick={add}>Show toast</button>
    <div className="mc-stack" aria-live="polite" aria-relevant="additions text">{toasts.map(toast => <div className="mc-card mc-wide" key={toast.id}>
      <span>{toast.message}</span><button aria-label={`Dismiss ${toast.message}`} onClick={() => dismiss(toast.id)}>×</button>
    </div>)}</div>
  </div>;
}
