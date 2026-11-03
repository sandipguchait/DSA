import { useId, useRef, useState } from "react";

export default function Modal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [result, setResult] = useState("No action taken yet.");
  return <div className="mc-stack">
    <h3>Archive this project?</h3><p>Try Escape, the close button, or clicking the backdrop.</p>
    <button ref={trigger} onClick={() => dialog.current?.showModal()}>Open modal</button>
    <p role="status">{result}</p>
    <dialog ref={dialog} className="mc-modal" aria-labelledby={titleId}
      onClose={() => trigger.current?.focus()}
      onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.current?.close(); } }}>
      <div className="mc-stack"><h3 id={titleId}>Archive project</h3><p>Your project can be restored later.</p>
        <div className="mc-row"><button autoFocus onClick={() => dialog.current?.close()}>Cancel</button>
          <button onClick={() => { setResult("Project archived."); dialog.current?.close(); }}>Confirm archive</button></div>
      </div>
    </dialog>
  </div>;
}
