import { useState } from "react";

function findWinner(board: number[]) {
  for (let row = 0; row < 6; row++) for (let col = 0; col < 7; col++) {
    const value = board[row * 7 + col];
    if (!value) continue;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      if (Array.from({ length: 4 }, (_, n) => [row + dr * n, col + dc * n]).every(([r, c]) => r >= 0 && r < 6 && c >= 0 && c < 7 && board[r * 7 + c] === value)) return value;
    }
  }
  return 0;
}
export default function ConnectFour() {
  const [board, setBoard] = useState<number[]>(Array(42).fill(0));
  const player = board.filter(Boolean).length % 2 + 1;
  const winner = findWinner(board);
  function drop(column: number) {
    if (winner) return;
    for (let row = 5; row >= 0; row--) if (!board[row * 7 + column]) {
      setBoard(cells => cells.map((value, index) => index === row * 7 + column ? player : value)); return;
    }
  }
  return <div className="mc-stack"><h3>Connect Four</h3><p role="status">{winner ? `Player ${winner} wins!` : board.every(Boolean) ? "Draw!" : `Player ${player}'s turn`}</p>
    <div className="mc-board" style={{ gridTemplateColumns: "repeat(7, 1fr)", maxWidth: 420 }}>
      {Array.from({ length: 7 }, (_, c) => <button key={`drop-${c}`} aria-label={`Drop into column ${c + 1}`} disabled={!!winner || !!board[c]} onClick={() => drop(c)}>↓</button>)}
      {board.map((value, i) => <div key={i} className="mc-disc" aria-label={`Row ${Math.floor(i / 7) + 1}, column ${i % 7 + 1}: ${value ? `player ${value}` : "empty"}`} style={{ background: value === 1 ? "#f87171" : value === 2 ? "#facc15" : "var(--cell)", color: "#101828" }}>{value || ""}</div>)}
    </div><button onClick={() => setBoard(Array(42).fill(0))}>New game</button>
  </div>;
}
