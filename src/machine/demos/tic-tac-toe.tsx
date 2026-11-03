import { useState } from "react";

const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export default function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const player = board.filter(Boolean).length % 2 === 0 ? "X" : "O";
  const winningLine = lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  const winner = winningLine ? board[winningLine[0]] : null;
  const draw = !winner && board.every(Boolean);
  return <div className="mc-stack"><h3>Tic-tac-toe</h3><p role="status">{winner ? `${winner} wins!` : draw ? "Draw!" : `${player}'s turn`}</p>
    <div className="mc-board" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>{board.map((cell, index) => <button key={index} className="mc-square"
      aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${cell || "empty"}`} disabled={!!cell || !!winner}
      style={winningLine?.includes(index) ? { background: "var(--easy-bg)" } : undefined}
      onClick={() => setBoard(items => items.map((value, i) => i === index ? player : value))}>{cell || "·"}</button>)}</div>
    <button onClick={() => setBoard(Array(9).fill(null))}>New game</button>
  </div>;
}
