"use client";

import { useEffect, useMemo, useState } from "react";
import { TYPING_HISTORY, TYPING_PASSAGES } from "@/lib/student-data";
import { btnGhost, btnPrimary, fieldClass } from "@/components/ui/ui";

const DURATIONS = [1, 3, 5, 10] as const;

export function TypingTest() {
  const [lang, setLang] = useState<"english" | "hindi">("english");
  const [minutes, setMinutes] = useState<(typeof DURATIONS)[number]>(1);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(60);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const passage = TYPING_PASSAGES[lang];

  useEffect(() => {
    if (!running || done) return;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running, done]);

  const stats = useMemo(() => {
    const elapsedMin = Math.max((minutes * 60 - left) / 60, 1 / 60);
    let correct = 0;
    let errors = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === passage[i]) correct += 1;
      else errors += 1;
    }
    const wpm = Math.round(typed.length / 5 / elapsedMin);
    const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { wpm, accuracy, errors };
  }, [typed, passage, minutes, left]);

  const start = () => {
    setTyped("");
    setDone(false);
    setLeft(minutes * 60);
    setRunning(true);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Typing test</h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        English + Hindi · 1 / 3 / 5 / 10 minutes · live WPM, accuracy, errors.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["english", "hindi"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={lang === item}
            onClick={() => setLang(item)}
            disabled={running}
            className={lang === item ? btnPrimary : btnGhost}
          >
            {item}
          </button>
        ))}
        {DURATIONS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={minutes === m}
            disabled={running}
            onClick={() => setMinutes(m)}
            className={minutes === m ? btnPrimary : btnGhost}
          >
            {m} min
          </button>
        ))}
      </div>

      <p className="card-surface mt-6 p-5 font-sans text-sm leading-relaxed text-zinc-300">
        {passage}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["WPM", stats.wpm],
          ["Accuracy", `${stats.accuracy}%`],
          ["Errors", stats.errors],
        ].map(([k, v]) => (
          <div key={k} className="card-surface p-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{k}</p>
            <p className="mt-1 font-sans text-xl font-semibold text-accent">{v}</p>
          </div>
        ))}
      </div>

      <textarea
        value={typed}
        disabled={!running}
        onChange={(e) => setTyped(e.target.value)}
        className={`${fieldClass} mt-4 min-h-36`}
        placeholder={running ? "Start typing…" : "Press start to begin"}
      />

      <div className="mt-4 flex items-center gap-3">
        <button type="button" className={btnPrimary} onClick={start} disabled={running}>
          {done ? "Retry" : "Start"}
        </button>
        <span className="font-mono text-sm text-zinc-400">{left}s</span>
      </div>

      {done ? (
        <div className="card-surface mt-6 p-6">
          <h2 className="font-sans text-xl font-semibold">Certificate-style result</h2>
          <p className="mt-2 font-sans text-sm text-zinc-400">
            {stats.wpm} WPM · {stats.accuracy}% accuracy · {stats.errors} errors · {minutes} min · {lang}
          </p>
          <button type="button" className={`${btnGhost} mt-4`} onClick={() => window.print()}>
            Download / share
          </button>
        </div>
      ) : null}

      <h2 className="mt-10 font-sans text-xl font-semibold">History</h2>
      <ul className="mt-3 space-y-2">
        {TYPING_HISTORY.map((row) => (
          <li key={`${row.date}-${row.lang}`} className="card-surface px-4 py-3 text-sm">
            {row.date} · {row.lang} · {row.wpm} WPM · {row.accuracy}%
          </li>
        ))}
      </ul>
    </div>
  );
}
