import { useState } from "react";
import { highlight } from "../lib/format";

export default function CodeViewer({ code, label }: { code: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = code.split("\n");

  return <div className="mc-code-viewer">
    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-mute">
      <span>{lines.length} lines</span>
      <button className="mc-action" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
        {expanded ? "Limit code height" : "Expand full code"}
      </button>
    </div>
    <pre className="mc-source" data-expanded={expanded} tabIndex={0} aria-label={label}>
      <code>{lines.map((line, i) => <span className="mc-source-line" key={i}>
        <span className="mc-line-number" aria-hidden="true">{i + 1}</span>
        <span className="mc-source-text">{highlight(line)}</span>
      </span>)}</code>
    </pre>
  </div>;
}
