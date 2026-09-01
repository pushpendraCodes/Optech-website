"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Keyboard,
  PlayCircle,
  Target,
  Translate,
  WarningCircle,
} from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { wpmLabel, type TypingLang } from "@/lib/typing-passages";
import { btnGhost, btnPrimary, fieldClass } from "@/components/ui/ui";
import {
  useGetStudentTypingAttemptsQuery,
  useGetStudentTypingParagraphsQuery,
  useStartTypingMutation,
  useSubmitTypingMutation,
} from "@/lib/api";
import { useStudentAuth } from "@/components/providers/StudentAuth";

const DURATIONS = [1, 3, 5, 10] as const;

type LangCode = "en" | "hi";
type Phase = "browse" | "running" | "result";

type TypingTestItem = {
  id: string;
  language: LangCode;
  text: string;
  preview: string;
  wordCount: number;
  fromApi: boolean;
};

const LANG_META: Record<LangCode, { labelKey: "st_type_en" | "st_type_hi"; uiLang: TypingLang }> = {
  en: { labelKey: "st_type_en", uiLang: "english" },
  hi: { labelKey: "st_type_hi", uiLang: "hindi" },
};

function previewText(text: string, max = 100) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
  return { wpm, accuracy, errors, correct };
}

function PassageView({ passage, typed }: { passage: string; typed: string }) {
  const chars = passage.split("");
  const caret = typed.length;

  return (
    <p className="font-sans text-base leading-relaxed md:text-lg" aria-hidden>
      {chars.map((ch, i) => {
        let className = "text-zinc-500";
        if (i < typed.length) {
          className =
            typed[i] === ch
              ? "text-emerald-300"
              : "text-red-400 bg-red-500/15 underline decoration-red-400/50";
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

export function TypingTest() {
  const { studentId } = useStudentAuth();
  const { data: paraRes, isLoading: paraLoading } = useGetStudentTypingParagraphsQuery(undefined, {
    skip: !studentId,
  });
  const { data: historyRes } = useGetStudentTypingAttemptsQuery(undefined, { skip: !studentId });
  const [startTyping] = useStartTypingMutation();
  const [submitTyping] = useSubmitTypingMutation();

  const [phase, setPhase] = useState<Phase>("browse");
  const [selectedLang, setSelectedLang] = useState<LangCode | null>(null);
  const [durationByTest, setDurationByTest] = useState<Record<string, number>>({});
  const [activeTest, setActiveTest] = useState<TypingTestItem | null>(null);
  const [minutes, setMinutes] = useState<(typeof DURATIONS)[number]>(1);
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(60);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tests: TypingTestItem[] = useMemo(() => {
    const rows = paraRes?.data ?? [];
    return rows.map((row) => {
      const text = String(row.text ?? "");
      const language = (String(row.language ?? "en") === "hi" ? "hi" : "en") as LangCode;
      return {
        id: String(row._id),
        language,
        text,
        preview: previewText(text),
        wordCount: wordCount(text),
        fromApi: true,
      };
    });
  }, [paraRes?.data]);

  const languages = useMemo(() => {
    const codes = [...new Set(tests.map((t) => t.language))].sort();
    return codes as LangCode[];
  }, [tests]);

  useEffect(() => {
    if (!selectedLang && languages.length) {
      setSelectedLang(languages[0]);
    }
  }, [languages, selectedLang]);

  const filteredTests = useMemo(
    () => (selectedLang ? tests.filter((t) => t.language === selectedLang) : []),
    [selectedLang, tests],
  );

  const history = useMemo(() => {
    return (historyRes?.data ?? []).map((row) => ({
      id: String(row._id),
      lang: String(row.language ?? "en") === "hi" ? "Hindi" : "English",
      wpm: Number(row.wpm ?? 0),
      accuracy: Number(row.accuracy ?? 0),
      errors: Number(row.errorCount ?? 0),
      minutes: Number(row.minutes ?? 0),
      date: formatDate(row.createdAt ? String(row.createdAt) : undefined),
    }));
  }, [historyRes?.data]);

  const totalSec = minutes * 60;
  const elapsedSec = totalSec - left;
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
    if (phase === "running") inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "result" || !activeTest) return;
    void submitTyping({
      language: activeTest.language,
      minutes,
      source: passage,
      typed,
    });
  }, [activeTest, minutes, passage, phase, submitTyping, typed]);

  async function beginTest(test: TypingTestItem) {
    const pickedMinutes = (durationByTest[test.id] ?? 1) as (typeof DURATIONS)[number];
    setActiveTest(test);
    setMinutes(pickedMinutes);
    setTyped("");
    setLeft(pickedMinutes * 60);

    if (test.fromApi) {
      try {
        const body = await startTyping({
          language: test.language,
          minutes: pickedMinutes,
          paragraphId: test.id,
        }).unwrap();
        setPassage(String(body.data.paragraph?.text ?? test.text));
      } catch {
        setPassage(test.text);
      }
    } else {
      setPassage(test.text);
    }
    setPhase("running");
  }

  function backToBrowse() {
    setPhase("browse");
    setActiveTest(null);
    setPassage("");
    setTyped("");
    setLeft(minutes * 60);
  }

  if (phase === "running" || phase === "result") {
    const uiLang = activeTest ? LANG_META[activeTest.language].uiLang : "english";
    const label = wpmLabel(stats.wpm, uiLang);
    const timePct = totalSec > 0 ? (left / totalSec) * 100 : 0;

    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={backToBrowse}
          disabled={phase === "running"}
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition hover:text-accent disabled:opacity-40"
        >
          <ArrowLeft size={12} aria-hidden />
          All typing tests
        </button>

        {phase === "running" ? (
          <>
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <div className="border-b border-white/8 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      <Tx k={LANG_META[activeTest!.language].labelKey} /> · {minutes} min
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">{activeTest?.preview}</p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1.5 font-mono text-lg text-accent">
                      <Clock size={16} aria-hidden />
                      {formatTime(left)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      timePct <= 20 ? "bg-red-500" : timePct <= 40 ? "bg-amber-500" : "bg-accent"
                    }`}
                    style={{ width: `${timePct}%` }}
                  />
                </div>
              </div>

              <div className="card-surface m-5 p-5">
                <PassageView passage={passage} typed={typed} />
              </div>

              <div className="grid grid-cols-3 gap-3 px-5 pb-5">
                {[
                  ["st_type_wpm", stats.wpm],
                  ["st_type_acc", `${stats.accuracy}%`],
                  ["st_type_err", stats.errors],
                ].map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/3 p-3 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <Tx k={key as "st_type_wpm"} />
                    </p>
                    <p className="mt-1 font-sans text-xl font-semibold text-accent">{value}</p>
                  </div>
                ))}
              </div>

              <textarea
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className={`${fieldClass} mx-5 mb-5 min-h-36`}
                placeholder="Start typing…"
              />
            </article>
          </>
        ) : (
          <article className="overflow-hidden rounded-3xl border border-accent/25 bg-linear-to-br from-accent/10 via-zinc-950 to-zinc-950 p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <Tx k="st_type_result" />
            </p>
            <h2 className="mt-2 font-sans text-3xl font-semibold">{stats.wpm} WPM</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {label} · {stats.accuracy}% accuracy · {stats.errors} errors · {minutes} min ·{" "}
              <Tx k={LANG_META[activeTest!.language].labelKey} />
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["st_type_wpm", stats.wpm],
                ["st_type_acc", `${stats.accuracy}%`],
                ["st_type_err", stats.errors],
              ].map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/3 p-4 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <Tx k={key as "st_type_wpm"} />
                  </p>
                  <p className="mt-1 font-sans text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={btnPrimary} onClick={() => activeTest && void beginTest(activeTest)}>
                <Tx k="st_type_retry" />
              </button>
              <button type="button" className={btnGhost} onClick={backToBrowse}>
                All tests
              </button>
            </div>
          </article>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        <Tx k="st_module" />
      </p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight">
        <Tx k="st_type_title" />
      </h1>
      <p className="mt-2 font-sans text-sm text-zinc-400">
        <Tx k="st_type_lead" />
      </p>

      {paraLoading ? (
        <div className="mt-8 h-48 animate-pulse rounded-3xl border border-white/10 bg-white/3" />
      ) : languages.length === 0 ? (
        <div className="card-surface mt-8 p-10 text-center">
          <Keyboard size={36} className="mx-auto text-zinc-600" aria-hidden />
          <p className="mt-4 font-sans text-lg font-semibold">No typing tests available</p>
          <p className="mt-2 text-sm text-zinc-400">Admin has not published any typing paragraphs yet.</p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <Translate size={14} aria-hidden />
              Select language
            </p>
            <div className="flex flex-wrap gap-2">
              {languages.map((code) => {
                const count = tests.filter((t) => t.language === code).length;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedLang(code)}
                    className={`cursor-pointer rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                      selectedLang === code
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <Tx k={LANG_META[code].labelKey} /> ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {filteredTests.length} test{filteredTests.length === 1 ? "" : "s"} in{" "}
              {selectedLang ? <Tx k={LANG_META[selectedLang].labelKey} /> : null}
            </p>
            {filteredTests.map((test, index) => {
              const picked = durationByTest[test.id] ?? 1;
              return (
                <article
                  key={test.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-5 transition hover:border-accent/25"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
                          Test {index + 1}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                          {test.wordCount} words
                        </span>
                      </div>
                      <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-300">{test.preview}</p>
                    </div>
                    <div className="shrink-0 space-y-3 lg:w-52">
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Duration</p>
                        <div className="flex flex-wrap gap-1.5">
                          {DURATIONS.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setDurationByTest((prev) => ({ ...prev, [test.id]: m }))}
                              className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                                picked === m
                                  ? "border-accent/40 bg-accent/15 text-accent"
                                  : "border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                            >
                              <Tx k="st_type_min" vars={{ n: m }} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" className={`${btnPrimary} w-full justify-center`} onClick={() => void beginTest(test)}>
                        <PlayCircle size={14} aria-hidden />
                        <Tx k="st_type_start" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-accent" aria-hidden />
          <h2 className="font-sans text-xl font-semibold">
            <Tx k="st_type_history" />
          </h2>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No attempts recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm"
              >
                <span className="text-zinc-300">
                  {row.date} · {row.lang} · {row.minutes} min
                </span>
                <span className="font-mono text-accent">
                  {row.wpm} WPM · {row.accuracy}% · {row.errors} err
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 flex items-center gap-2 text-center text-xs text-zinc-600">
        <WarningCircle size={14} aria-hidden />
        Paragraphs are loaded from admin typing bank · results saved to your account
      </p>
    </div>
  );
}
