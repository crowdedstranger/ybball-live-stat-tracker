import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, LayoutDashboard, Undo2, Users } from "lucide-react";

type StatKey = "pts" | "reb" | "ast" | "stl" | "blk" | "fls";

type Player = {
  id: string;
  name: string;
  inCourt: boolean;
  stats: Record<StatKey, number>;
};

const STATS: { key: StatKey; label: string }[] = [
  { key: "pts", label: "PTS" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "stl", label: "STL" },
  { key: "blk", label: "BLK" },
  { key: "fls", label: "FLS" },
];

const emptyStats = (): Record<StatKey, number> => ({
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  fls: 0,
});

const uid = () => Math.random().toString(36).slice(2);

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: uid(), name: "Player 1", inCourt: true, stats: emptyStats() },
    { id: uid(), name: "Player 2", inCourt: true, stats: emptyStats() },
    { id: uid(), name: "Player 3", inCourt: true, stats: emptyStats() },
    { id: uid(), name: "Player 4", inCourt: true, stats: emptyStats() },
    { id: uid(), name: "Player 5", inCourt: true, stats: emptyStats() },
  ]);

  const [history, setHistory] = useState<
    { id: string; stat: StatKey; delta: number }[]
  >([]);

  const apply = (id: string, stat: StatKey, delta: number) => {
    setPlayers((p) =>
      p.map((pl) =>
        pl.id === id
          ? {
              ...pl,
              stats: {
                ...pl.stats,
                [stat]: Math.max(0, pl.stats[stat] + delta),
              },
            }
          : pl
      )
    );
    setHistory((h) => [...h, { id, stat, delta }]);
  };

  const undo = () => {
    setHistory((h) => {
      const last = h[h.length - 1];
      if (!last) return h;
      setPlayers((p) =>
        p.map((pl) =>
          pl.id === last.id
            ? {
                ...pl,
                stats: {
                  ...pl.stats,
                  [last.stat]: Math.max(
                    0,
                    pl.stats[last.stat] - last.delta
                  ),
                },
              }
            : pl
        )
      );
      return h.slice(0, -1);
    });
  };

  const totals = useMemo(() => {
    const t = emptyStats();
    players.forEach((p) =>
      STATS.forEach((s) => (t[s.key] += p.stats[s.key]))
    );
    return t;
  }, [players]);

  const exportCSV = () => {
    const header = ["Player", ...STATS.map((s) => s.label)].join(",");
    const rows = players.map(
      (p) =>
        [p.name, ...STATS.map((s) => p.stats[s.key])].join(",")
    );
    const totalsRow = [
      "TEAM TOTALS",
      ...STATS.map((s) => totals[s.key]),
    ].join(",");
    const csv = [header, ...rows, totalsRow].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game-stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Live Basketball Stat Tracker</h1>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="rounded-xl bg-white px-4 py-2 font-bold shadow"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={exportCSV}
              className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white shadow"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 rounded-xl bg-white p-3 font-bold">
          <div>Player</div>
          {STATS.map((s) => (
            <div key={s.key} className="text-center">
              {s.label}
            </div>
          ))}
        </div>

        {players.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-7 items-center gap-2 rounded-xl bg-white p-3 shadow"
          >
            <div className="font-bold">{p.name}</div>
            {STATS.map((s) => (
              <div key={s.key} className="flex justify-center gap-2">
                <button
                  onClick={() => apply(p.id, s.key, -1)}
                  className="h-8 w-8 rounded-lg bg-slate-200 font-black"
                >
                  −
                </button>
                <div className="w-6 text-center font-black">
                  {p.stats[s.key]}
                </div>
                <button
                  onClick={() => apply(p.id, s.key, 1)}
                  className="h-8 w-8 rounded-lg bg-blue-700 font-black text-white"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        ))}

        <div className="grid grid-cols-7 rounded-xl bg-yellow-100 p-3 font-black">
          <div>TEAM</div>
          {STATS.map((s) => (
            <div key={s.key} className="text-center">
              {totals[s.key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
