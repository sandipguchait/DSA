import { useState } from "react";

type Comment = { id: number; parent: number | null; text: string };
export default function NestedComments() {
  const [comments, setComments] = useState<Comment[]>([{ id: 1, parent: null, text: "What makes a good component API?" }, { id: 2, parent: 1, text: "Clear inputs and predictable state ownership." }]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  function render(parent: number | null, depth = 0): React.ReactNode {
    return comments.filter(comment => comment.parent === parent).map(comment => <article className="mc-comment" key={comment.id}>
      <p>{comment.text}</p><button onClick={() => setReplyTo(comment.id)} disabled={depth >= 3}>Reply{depth >= 3 ? " (depth limit)" : ""}</button>
      {render(comment.id, depth + 1)}
    </article>);
  }
  return <div className="mc-stack"><h3>Discussion</h3>{render(null)}
    <form className="mc-stack" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; setComments(items => [...items, { id: Date.now(), parent: replyTo, text: draft.trim() }]); setDraft(""); setReplyTo(null); }}>
      <label htmlFor="reply">{replyTo ? `Reply to comment #${replyTo}` : "Add a comment"}</label>
      <textarea id="reply" value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} required />
      <div className="mc-row"><button type="submit">Post comment</button>{replyTo && <button type="button" onClick={() => setReplyTo(null)}>Cancel reply</button>}</div>
    </form>
  </div>;
}
