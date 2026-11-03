import { useState } from "react";

export default function StarRating() {
  const [rating, setRating] = useState(3);
  const [hovered, setHovered] = useState(0);
  return (
    <div className="mc-stack">
      <h3>How was your experience?</h3>
      <div className="mc-row" onMouseLeave={() => setHovered(0)} role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map(value => (
          <button key={value} className="mc-star" aria-label={`Rate ${value} out of 5`}
            aria-pressed={rating === value} onMouseEnter={() => setHovered(value)}
            onFocus={() => setHovered(value)} onBlur={() => setHovered(0)}
            onClick={() => setRating(value)} style={{ color: value <= (hovered || rating) ? "#e9ad20" : "var(--line2)" }}>★</button>
        ))}
      </div>
      <p role="status">{rating} out of 5 stars</p>
      <button onClick={() => setRating(0)}>Clear rating</button>
    </div>
  );
}
