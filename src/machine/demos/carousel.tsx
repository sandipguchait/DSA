import { useState } from "react";

const slides = [
  { title: "Alpine morning", color: "#225c65", shape: "⛰", description: "Mountains under a clear blue sky" },
  { title: "Golden dunes", color: "#936326", shape: "☀", description: "Sunlight over warm desert dunes" },
  { title: "Ocean breeze", color: "#254c88", shape: "≈", description: "Waves rolling across the open sea" },
];
export default function Carousel() {
  const [index, setIndex] = useState(0);
  function move(delta: number) { setIndex(i => (i + delta + slides.length) % slides.length); }
  return <div className="mc-stack" role="region" aria-roledescription="carousel" aria-label="Illustrated destinations"
    tabIndex={0} onKeyDown={e => { if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); e.stopPropagation(); move(e.key === "ArrowRight" ? 1 : -1); } }}>
    <div className="mc-landscape" role="img" aria-label={slides[index].description} style={{ background: slides[index].color }}>
      <span aria-hidden="true">{slides[index].shape}</span><strong>{slides[index].title}</strong>
    </div>
    <div className="mc-wide"><button onClick={() => move(-1)}>← Previous</button><span aria-live="polite">{index + 1} / {slides.length}</span><button onClick={() => move(1)}>Next →</button></div>
    <div className="mc-row">{slides.map((slide, i) => <button key={slide.title} aria-label={`Show ${slide.title}`} aria-pressed={index === i} onClick={() => setIndex(i)}>{i + 1}</button>)}</div>
    <p>Original CSS illustrations; no remote image requests.</p>
  </div>;
}
