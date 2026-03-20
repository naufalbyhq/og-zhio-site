"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { DEFAULT_PRESET, PRESETS, type PresetId } from "@/lib/presets";

const THEMES = [
  { id: "midnight", label: "Midnight Teal" },
  { id: "aurora", label: "Aurora Glass" },
  { id: "sunset", label: "Sunset Ember" },
  { id: "mono", label: "Mono Steel" },
  { id: "ocean", label: "Ocean Blue" },
  { id: "forest", label: "Forest Emerald" },
  { id: "rose", label: "Rose Bloom" },
  { id: "violet", label: "Violet Night" },
  { id: "amber", label: "Amber Glow" },
  { id: "graphite", label: "Graphite" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const THEME_UI: Record<ThemeId, { pageBg: string; panelBg: string; previewBg: string; accentBtn: string; accentHover: string; accentTag: string; focus: string; }> = {
  midnight: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#152a4a_0%,#070b14_58%,#020409_100%)]",
    panelBg: "bg-slate-950/65 border-cyan-200/15",
    previewBg: "bg-slate-950/45 border-cyan-200/10",
    accentBtn: "bg-cyan-300 text-slate-950",
    accentHover: "hover:bg-cyan-200",
    accentTag: "text-cyan-300/90",
    focus: "focus:border-cyan-400",
  },
  aurora: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#114b5f_0%,#0b132b_55%,#05070f_100%)]",
    panelBg: "bg-slate-950/65 border-emerald-200/20",
    previewBg: "bg-slate-950/45 border-emerald-200/15",
    accentBtn: "bg-emerald-300 text-slate-950",
    accentHover: "hover:bg-emerald-200",
    accentTag: "text-emerald-300/90",
    focus: "focus:border-emerald-400",
  },
  sunset: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#7a2e1f_0%,#24120a_58%,#080505_100%)]",
    panelBg: "bg-zinc-950/65 border-orange-200/20",
    previewBg: "bg-zinc-950/45 border-orange-200/15",
    accentBtn: "bg-orange-300 text-zinc-950",
    accentHover: "hover:bg-orange-200",
    accentTag: "text-orange-300/90",
    focus: "focus:border-orange-400",
  },
  mono: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#2a2f38_0%,#12151c_58%,#040507_100%)]",
    panelBg: "bg-zinc-950/70 border-zinc-200/20",
    previewBg: "bg-zinc-950/50 border-zinc-200/15",
    accentBtn: "bg-zinc-300 text-zinc-950",
    accentHover: "hover:bg-zinc-200",
    accentTag: "text-zinc-300/90",
    focus: "focus:border-zinc-400",
  },
  ocean: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#0353a4_0%,#061a40_58%,#030814_100%)]",
    panelBg: "bg-slate-950/68 border-sky-200/20",
    previewBg: "bg-slate-950/45 border-sky-200/15",
    accentBtn: "bg-sky-300 text-slate-950",
    accentHover: "hover:bg-sky-200",
    accentTag: "text-sky-300/90",
    focus: "focus:border-sky-400",
  },
  forest: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#2d6a4f_0%,#1b4332_58%,#081c15_100%)]",
    panelBg: "bg-emerald-950/60 border-green-200/20",
    previewBg: "bg-emerald-950/35 border-green-200/15",
    accentBtn: "bg-green-300 text-emerald-950",
    accentHover: "hover:bg-green-200",
    accentTag: "text-green-300/90",
    focus: "focus:border-green-400",
  },
  rose: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#d63384_0%,#7a1f4b_58%,#2b0a1c_100%)]",
    panelBg: "bg-rose-950/60 border-rose-200/20",
    previewBg: "bg-rose-950/35 border-rose-200/15",
    accentBtn: "bg-rose-300 text-rose-950",
    accentHover: "hover:bg-rose-200",
    accentTag: "text-rose-300/90",
    focus: "focus:border-rose-400",
  },
  violet: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#7b2cbf_0%,#3a1f6d_58%,#180b2e_100%)]",
    panelBg: "bg-violet-950/60 border-violet-200/20",
    previewBg: "bg-violet-950/35 border-violet-200/15",
    accentBtn: "bg-violet-300 text-violet-950",
    accentHover: "hover:bg-violet-200",
    accentTag: "text-violet-300/90",
    focus: "focus:border-violet-400",
  },
  amber: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#ff8c00_0%,#8f3b00_58%,#261400_100%)]",
    panelBg: "bg-amber-950/55 border-amber-200/20",
    previewBg: "bg-amber-950/35 border-amber-200/15",
    accentBtn: "bg-amber-300 text-amber-950",
    accentHover: "hover:bg-amber-200",
    accentTag: "text-amber-300/90",
    focus: "focus:border-amber-400",
  },
  graphite: {
    pageBg: "bg-[radial-gradient(circle_at_top_left,#474747_0%,#2b2b2b_58%,#151515_100%)]",
    panelBg: "bg-zinc-900/60 border-slate-200/20",
    previewBg: "bg-zinc-900/35 border-slate-200/15",
    accentBtn: "bg-slate-300 text-slate-950",
    accentHover: "hover:bg-slate-200",
    accentTag: "text-slate-300/90",
    focus: "focus:border-slate-400",
  },
};

export default function Home() {
  const [presetId, setPresetId] = useState<PresetId>(DEFAULT_PRESET);
  const [theme, setTheme] = useState<ThemeId>("midnight");
  const [title, setTitle] = useState("Quote of the day");
  const [author, setAuthor] = useState("zhio.site");
  const [content, setContent] = useState(
    "Make your message visible in one frame, so people remember it in one glance.",
  );

  const selectedPreset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
  const ui = THEME_UI[theme];

  const imageUrl = useMemo(() => {
    const params = new URLSearchParams({
      preset: presetId,
      theme,
      title,
      author,
      content,
    });

    return `/api/image?${params.toString()}`;
  }, [author, content, presetId, theme, title]);

  const downloadUrl = `${imageUrl}&download=1`;

  return (
    <div className={`min-h-screen w-full text-slate-100 ${ui.pageBg}`}>
      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <section className={`rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur ${ui.panelBg}`}>
          <div className="mb-6 space-y-2">
            <p className={`text-xs uppercase tracking-[0.26em] ${ui.accentTag}`}>zhio utility lab</p>
            <h1 className="font-serif text-3xl leading-tight text-white md:text-4xl">
              OpenGraph and Quote Image Generator
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Paste text, quotes, or code, then export image assets ready for Twitter, LinkedIn, and blog headers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Preset</span>
              <select
                value={presetId}
                onChange={(event) => setPresetId(event.target.value as PresetId)}
                className={`w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none transition ${ui.focus}`}
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.width}x{preset.height})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Theme</span>
              <select
                value={theme}
                onChange={(event) =>
                  setTheme(event.target.value as ThemeId)
                }
                className={`w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none transition ${ui.focus}`}
              >
                {THEMES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                className={`w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm outline-none transition ${ui.focus}`}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={700}
                rows={7}
                className={`w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm leading-6 outline-none transition ${ui.focus}`}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Author / Footer</span>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={60}
                className={`w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm outline-none transition ${ui.focus}`}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={downloadUrl}
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${ui.accentBtn} ${ui.accentHover}`}
            >
              Download PNG
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300"
            >
              Open Raw Image
            </a>
            <p className="text-xs text-slate-300">{selectedPreset.description}</p>
          </div>
        </section>

        <section className={`rounded-3xl border p-4 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur lg:p-5 ${ui.previewBg}`}>
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-300">
            <span>Live Preview</span>
            <span>
              {selectedPreset.width} x {selectedPreset.height}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/12 bg-slate-900/80">
            <Image
              src={imageUrl}
              alt="Live OpenGraph preview"
              className="h-auto w-full"
              width={selectedPreset.width}
              height={selectedPreset.height}
              unoptimized
              priority
            />
          </div>

          <p className="mt-3 text-xs text-slate-400">Tip: keep sentences concise for cleaner mobile previews.</p>
        </section>
      </main>
    </div>
  );
}
