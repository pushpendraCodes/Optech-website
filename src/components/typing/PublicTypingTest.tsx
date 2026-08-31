"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwise, Clock, Keyboard, Play, Target, WarningCircle } from "@phosphor-icons/react";
import { btnGhost, btnPrimary, fieldClass } from "@/components/ui/ui";
import { pickPassage, wpmLabel, type TypingLang } from "@/lib/typing-passages";

const DURATIONS = [1, 3, 5] as const;
type Phase = "setup" | "running" | "result";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function computeStats(typed: string, passage: string, elapsedSec: number) {
  let correct = 0;
  let errors = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === passage[i]) correct += 1;
    else errors += 1;
  }
  const elapsedMin = Math.max(elapsedSec / 60, 1 / 60);
  const wpm = Math.round(typed.length / 5 / elapsedMin);
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const chars = typed.length;
  return { wpm, accuracy, errors, correct, chars };
}

function PassageView({ passage, typed }: { passage: string; typed: string }) {
  const chars = passage.split("");
  const caret = typed.length;

  return (
    <p className="font-sans text-base leading-relaxed md:text-lg" aria-hidden>
      {chars.map((ch, i) => {
        let className = "text-zinc-500";
        if (i < typed.length) {
          className = typed[i] === ch ? "text-emerald-300" : "text-red-400 bg-red-500/15 underline decoration-red-400/50";
        } else if (i === caret) {
          className = "text-foreground bg-accent/25 border-b-2 border-accent";
        }
        return (
          <span key={i} className={className}>
            {ch}
          </span>
        );
      })}
    </p>
  );
}

export function PublicTypingTest() {
  const [lang, setLang] = useState<TypingLang>("english");
  const [minutes, setMinutes] = useState<(typeof DURATIONS)[number]>(1);
  const [phase, setPhase] = useState<Phase>("setup");
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const totalSec = minutes * 60;
  const elapsedSec = phase === "result" ? totalSec - left : totalSec - left;

  const stats = useMemo(
    () => computeStats(typed, passage, Math.max(elapsedSec, 1)),
    [typed, passage, elapsedSec],
  );

  const finish = useCallback(() => {
    setPhase("result");
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, finish]);

  useEffect(() => {
    if (phase === "running") {
      inputRef.current?.focus();
    }
  }, [phase]);

  function start() {
    setPassage(pickPassage(lang));
    setTyped("");
    setLeft(minutes * 60);
    setStartedAt(Date.now());
    setPhase("running");
  }

  function reset() {
    setPhase("setup");
    setTyped("");
    setPassage("");
    setLeft(minutes * 60);
    setStartedAt(null);
  }

  const label = wpmLabel(stats.wpm, lang);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Controls */}
      <div className="card-surface flex flex-wrap items-center gap-2 p-4">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Language</span>
        {(["english", "hindi"] as const).map((item) => (
          <button
            key={item}
            type="button"
            disabled={phase === "running"}
            onClick={() => setLang(item)}
            className={lang === item ? btnPrimary : btnGhost}
          >
            {item === "english" ? "English" : "Hindi"}
          </button>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-white/10 sm:inline" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Duration</span>
        {DURATIONS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={phase === "running"}
            onClick={() => setMinutes(m)}
            className={minutes === m ? btnPrimary : btnGhost}
          >
            {m} min
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Clock, label: "Time", value: formatTime(left) },
          { icon: Keyboard, label: "WPM", value: phase === "setup" ? "—" : stats.wpm },
          { icon: Target, label: "Accuracy", value: phase === "setup" ? "—" : `${stats.accuracy}%` },
          { icon: WarningCircle, label: "Errors", value: phase === "setup" ? "—" : stats.errors },
        ].map(({ icon: Icon, label: lbl, value }) => (
          <div key={lbl} className="card-surface flex items-center gap-3 p-4">
            <Icon size={20} className="shrink-0 text-accent" aria-hidden />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{lbl}</p>
              <p className="font-sans text-xl font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Passage */}
      <div className="card-surface mt-4 min-h-[120px] p-5 md:p-6">
        {phase === "setup" ? (
          <p className="text-center font-sans text-sm text-zinc-500">
            Choose language and duration, then press Start. A random passage will appear — type it as accurately as you can.
          </p>
        ) : (
          <PassageView passage={passage} typed={typed} />
        )}
      </div>

      {/* Input */}
      <textarea
        ref={inputRef}
        value={typed}
        disabled={phase !== "running"}
        onChange={(e) => setTyped(e.target.value)}
        className={`${fieldClass} mt-4 min-h-28 resize-none font-mono text-sm`}
        placeholder={phase === "running" ? "Start typing here…" : "Press Start to begin the test"}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {phase === "setup" ? (
          <button type="button" className={btnPrimary} onClick={start}>
            <Play size={14} weight="fill" aria-hidden />
            Start test
          </button>
        ) : phase === "running" ? (
          <>
            <button type="button" className={btnGhost} onClick={finish}>
              Finish early
            </button>
            <p className="font-sans text-xs text-zinc-500">Results are shown only on this device — nothing is saved.</p>
          </>
        ) : (
          <button type="button" className={btnPrimary} onClick={reset}>
            <ArrowCounterClockwise size={14} aria-hidden />
            Try again
          </button>
        )}
      </div>

      {/* Result */}
      {phase === "result" ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-zinc-950 to-zinc-950 p-6 md:p-8">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.24em] text-accent">Test complete</p>
          <h2 className="mt-2 text-center font-sans text-2xl font-semibold">{label}</h2>
          <p className="mt-1 text-center text-sm text-zinc-400">
            {lang === "english" ? "English" : "Hindi"} · {minutes} minute{minutes === 1 ? "" : "s"}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["WPM", stats.wpm],
              ["Accuracy", `${stats.accuracy}%`],
              ["Errors", stats.errors],
              ["Characters", stats.chars],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{k}</p>
                <p className="mt-1 font-sans text-2xl font-semibold text-accent">{v}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Want a certified typing score? Enroll in our{" "}
            <span className="text-accent">English & Hindi Typing</span> course at campus.
          </p>
        </div>
      ) : null}

      {startedAt && phase === "result" ? (
        <p className="mt-3 text-center font-mono text-[10px] text-zinc-600">
          Session ended · results not stored
        </p>
      ) : null}
    </div>
  );
}
