import { useRef, useState } from "react";

const columns = ["Backlog", "In progress", "Done"];
const initial = [{ id: 1, title: "Design component API", column: 0 }, { id: 2, title: "Build keyboard support", column: 1 }, { id: 3, title: "Write requirements", column: 2 }];
export default function Kanban() {
  const [tasks, setTasks] = useState(initial);
  const [message, setMessage] = useState("Drag cards between columns, or choose a status.");
  const dragged = useRef<number | null>(null);
  function move(id: number, column: number) {
    setTasks(items => items.map(task => task.id === id ? { ...task, column } : task));
    setMessage(`Task ${id} moved to ${columns[column]}.`);
  }
  return <div className="mc-stack"><h3>Project board</h3><div className="mc-kanban">{columns.map((column, index) =>
    <section className="mc-card mc-stack" key={column} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragged.current !== null) move(dragged.current, index); dragged.current = null; }}>
      <h4>{column} · {tasks.filter(task => task.column === index).length}</h4>
      {tasks.filter(task => task.column === index).map(task => <article className="mc-card mc-stack" key={task.id} draggable
        onDragStart={e => { dragged.current = task.id; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(task.id)); }} onDragEnd={() => { dragged.current = null; }}>
        <strong>{task.title}</strong><select aria-label={`Status for ${task.title}`} value={task.column} onChange={e => move(task.id, +e.target.value)}>{columns.map((label, i) => <option key={label} value={i}>{label}</option>)}</select>
      </article>)}
    </section>)}</div><p role="status">{message}</p>
  </div>;
}
