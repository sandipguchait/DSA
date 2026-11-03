import { useRef, useState } from "react";

export default function DragList() {
  const [items, setItems] = useState(["Clarify requirements", "Draw components", "Implement behavior", "Test edge cases"]);
  const dragged = useRef<string | null>(null);
  const [message, setMessage] = useState("Drag a task, or use its arrow buttons.");
  function move(id: string, destination: number) {
    setItems(previous => { const next = previous.filter(item => item !== id); next.splice(destination, 0, id); return next; });
    setMessage(`${id} moved to position ${destination + 1}.`);
  }
  return <div className="mc-stack"><h3>Interview plan</h3><ol className="mc-stack">{items.map((item, index) =>
    <li className="mc-card mc-wide" key={item} draggable onDragStart={e => { dragged.current = item; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", item); }}
      onDragOver={e => e.preventDefault()} onDragEnd={() => { dragged.current = null; }}
      onDrop={e => { e.preventDefault(); if (dragged.current && dragged.current !== item) move(dragged.current, index); dragged.current = null; }}>
      <span>⠿ {item}</span><div className="mc-row"><button aria-label={`Move ${item} up`} disabled={index === 0} onClick={() => move(item, index - 1)}>↑</button>
        <button aria-label={`Move ${item} down`} disabled={index === items.length - 1} onClick={() => move(item, index + 1)}>↓</button></div>
    </li>)}</ol><p role="status">{message}</p>
  </div>;
}
