import { useState } from "react";

const colors = [{ name: "Ocean", value: "#3478b8" }, { name: "Forest", value: "#39745c" }, { name: "Clay", value: "#b76b52" }];
const sizes = ["S", "M", "L"];
export default function ProductSwatches() {
  const [color, setColor] = useState("Ocean");
  const [size, setSize] = useState("M");
  const [message, setMessage] = useState("");
  const unavailable = (c: string, s: string) => c === "Clay" && s === "L";
  return <div className="mc-stack"><div className="mc-product" style={{ background: colors.find(c => c.name === color)?.value }}>Essential tee</div>
    <fieldset className="mc-stack"><legend>Color: {color}</legend><div className="mc-row">{colors.map(c => <button key={c.name} aria-pressed={color === c.name} onClick={() => { setColor(c.name); setMessage(""); if (unavailable(c.name, size)) setSize("M"); }}><span className="mc-swatch" style={{ background: c.value }} />{c.name}</button>)}</div></fieldset>
    <fieldset className="mc-stack"><legend>Size: {size}</legend><div className="mc-row">{sizes.map(s => <button key={s} aria-pressed={size === s} disabled={unavailable(color, s)} onClick={() => { setSize(s); setMessage(""); }}>{s}</button>)}</div></fieldset>
    <p>Clay / L is out of stock.</p><button onClick={() => setMessage(`Added ${color} / ${size} to the demo bag.`)}>Add to bag · ₹999</button><p role="status">{message}</p>
  </div>;
}
