import { useId, useState } from "react";

const questions = [
  ["What should I build first?", "Start with the smallest complete interaction, then add keyboard access and edge cases."],
  ["Where does state belong?", "Keep the open item ID at the closest common owner."],
  ["Can multiple items stay open?", "This version is single-open. Replace the ID with a Set to support multiple items."],
];
export default function Accordion() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return <div className="mc-stack">{questions.map(([question, answer], i) => (
    <section className="mc-card" key={question}>
      <h3><button id={`${id}-trigger-${i}`} className="mc-wide" aria-expanded={open === i} aria-controls={`${id}-answer-${i}`}
        onClick={() => setOpen(open === i ? null : i)}>{question}<span>{open === i ? "−" : "+"}</span></button></h3>
      <div role="region" id={`${id}-answer-${i}`} aria-labelledby={`${id}-trigger-${i}`} hidden={open !== i}><p className="mc-answer">{answer}</p></div>
    </section>
  ))}</div>;
}
