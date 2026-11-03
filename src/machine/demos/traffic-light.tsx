import { useEffect, useState } from "react";

const phases = [{ name: "Red", duration: 3000, color: "#f87171" }, { name: "Green", duration: 3000, color: "#4ade80" }, { name: "Amber", duration: 1000, color: "#facc15" }];
export default function TrafficLight() {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setPhase(value => (value + 1) % phases.length), phases[phase].duration);
    return () => clearTimeout(timer);
  }, [phase, running]);
  return <div className="mc-stack"><h3>Traffic signal</h3><div className="mc-traffic">{phases.map((light, i) =>
    <div key={light.name} className="mc-light" style={{ background: light.color, opacity: i === phase ? 1 : 0.12 }} aria-label={`${light.name}: ${i === phase ? "on" : "off"}`} />)}</div>
    <p role="status">{phases[phase].name} · {phases[phase].duration / 1000}s phase · {running ? "Running" : "Stopped"}</p>
    <div className="mc-row"><button onClick={() => setRunning(value => !value)}>{running ? "Stop" : "Start"}</button><button onClick={() => { setRunning(false); setPhase(0); }}>Reset</button></div>
    <p>Stop cancels the current phase. Start begins that phase's full duration again.</p>
  </div>;
}
