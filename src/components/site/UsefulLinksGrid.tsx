"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Check, CopySimple, FadersHorizontal, MagnifyingGlass, Star } from "@phosphor-icons/react";
import { Tx } from "@/components/i18n/Tx";
import { useI18n } from "@/components/providers/I18nProvider";
import { useGetLinksQuery } from "@/lib/api";
import type { MessageKey } from "@/lib/i18n";

const STAR_KEY = "optech-useful-link-stars";

type LinkCardData = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  sortOrder: number;
  cta: string;
  logoUrl: string;
};

function initials(title: string) {
  return (
    title
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function readStars(): string[] {
  try {
    const raw = localStorage.getItem(STAR_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function canTilt() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function LinkCard({
  link,
  starred,
  copied,
  brokenLogo,
  onBrokenLogo,
  onCopy,
  onStar,
}: {
  link: LinkCardData;
  starred: boolean;
  copied: boolean;
  brokenLogo: boolean;
  onBrokenLogo: () => void;
  onCopy: () => void;
  onStar: () => void;
}) {
  const { t } = useI18n();
  const cardRef = useRef<HTMLElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 30 });
  const showLogo = Boolean(link.logoUrl) && !brokenLogo;

  function resetTilt() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  }

  function tilt(event: MouseEvent<HTMLElement>) {
    const el = cardRef.current;
    if (!el || !canTilt()) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * 12;
    const rotateY = (px - 0.5) * 16;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(18px) scale3d(1.03, 1.03, 1.03)`;
    setShine({ x: px * 100, y: py * 100 });
  }

  return (
    <div className="[perspective:1100px]">
      <article
      ref={cardRef}
      onMouseMove={tilt}
      onMouseLeave={resetTilt}
      className={`useful-link-card group relative overflow-hidden rounded-[20px] border border-white/8 bg-[#121214] p-5 md:p-6 ${
        link.featured ? "useful-link-featured" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${shine.x}% ${shine.y}%, rgba(167,139,250,0.16), transparent 55%)`,
        }}
      />

      {link.featured ? (
        <span className="absolute right-4 top-4 z-10 rounded-full border border-violet-400/35 bg-violet-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-violet-200">
          <Tx k="links_featured" />
        </span>
      ) : null}

      <div className="relative z-10 flex items-start gap-4 pr-20">
        {showLogo ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
            <img
              src={link.logoUrl}
              alt=""
              className="h-full w-full object-contain"
              onError={onBrokenLogo}
            />
          </span>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/95 font-sans text-sm font-semibold text-zinc-800">
            {initials(link.title)}
          </span>
        )}
        <div className="min-w-0 pt-0.5">
          <h2 className="font-sans text-lg font-semibold leading-tight tracking-tight text-white">{link.title}</h2>
          {link.category ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{link.category}</p>
          ) : null}
        </div>
      </div>

      {link.description ? (
        <p className="relative z-10 mt-4 line-clamp-2 font-sans text-sm leading-relaxed text-zinc-400">{link.description}</p>
      ) : (
        <div className="mt-4 h-10" />
      )}

      <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300 transition-colors hover:text-violet-200"
        >
          {link.cta}
          <ArrowUpRight size={14} weight="bold" />
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? t("links_copied") : t("links_copy")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {copied ? <Check size={16} /> : <CopySimple size={16} />}
          </button>
          <button
            type="button"
            onClick={onStar}
            aria-label={starred ? t("links_unstar") : t("links_star")}
            aria-pressed={starred}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/5 ${
              starred ? "text-violet-300" : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            <Star size={16} weight={starred ? "fill" : "regular"} />
          </button>
        </div>
      </div>
    </article>
    </div>
  );
}

const pillBase =
  "cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors";
const pillIdle = "border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200";
const pillActive = "border-violet-400/50 bg-violet-500/20 text-white shadow-[0_0_18px_rgba(139,92,246,0.28)]";

export function UsefulLinksGrid({
  emptyKey = "links_empty",
}: {
  emptyKey?: MessageKey;
}) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useGetLinksQuery();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [stars, setStars] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setStars(readStars());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = useMemo(() => {
    const rows = (data?.data ?? []).map((link) => ({
      id: String(link._id ?? link.href ?? link.title),
      href: String(link.href ?? "#"),
      title: String(link.title ?? ""),
      description: String(link.body ?? ""),
      category: String(link.slot ?? "").trim(),
      featured: Boolean(link.featured),
      sortOrder: Number(link.sortOrder ?? 0),
      cta: String(link.cta ?? "").trim() || t("links_visit"),
      logoUrl: String(link.image?.url ?? "").trim(),
    }));
    return rows.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder);
  }, [data?.data, t]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const link of links) {
      if (!link.category) continue;
      const key = link.category.toLowerCase();
      if (!map.has(key)) map.set(key, link.category);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [links]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((link) => {
      if (featuredOnly && !link.featured) return false;
      if (category !== "all" && link.category.toLowerCase() !== category) return false;
      if (!q) return true;
      return `${link.title} ${link.description} ${link.category}`.toLowerCase().includes(q);
    });
  }, [links, query, category, featuredOnly]);

  function toggleStar(id: string) {
    setStars((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(STAR_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function copyLink(id: string, href: string) {
    try {
      await navigator.clipboard.writeText(href);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  const toolbar = (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("links_search")}
            className="w-full rounded-full border border-white/10 bg-[#161618] py-2.5 pl-11 pr-12 font-sans text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-violet-400/40"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline">
            /
          </kbd>
        </label>
        <button
          type="button"
          onClick={() => setFeaturedOnly((on) => !on)}
          aria-pressed={featuredOnly}
          className={`${pillBase} inline-flex shrink-0 items-center gap-2 px-4 py-2.5 ${featuredOnly ? pillActive : pillIdle}`}
        >
          <FadersHorizontal size={14} />
          <Tx k="links_featured" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`${pillBase} ${category === "all" ? pillActive : pillIdle}`}
        >
          <Tx k="links_all" />
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`${pillBase} ${category === key ? pillActive : pillIdle}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {toolbar}
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
          <Tx k="links_loading" />
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[188px] animate-pulse rounded-[20px] border border-white/8 bg-white/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {toolbar}
        <p className="font-sans text-sm text-zinc-400">
          <Tx k="links_empty" />
        </p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div>
        {toolbar}
        <p className="font-sans text-sm text-zinc-400">
          <Tx k={emptyKey} />
        </p>
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {t("links_count", { count: visible.length })}
      </p>
      {visible.length === 0 ? (
        <p className="font-sans text-sm text-zinc-400">
          <Tx k="links_no_match" />
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              starred={stars.includes(link.id)}
              copied={copiedId === link.id}
              brokenLogo={Boolean(brokenLogos[link.id])}
              onBrokenLogo={() => setBrokenLogos((current) => ({ ...current, [link.id]: true }))}
              onCopy={() => void copyLink(link.id, link.href)}
              onStar={() => toggleStar(link.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
