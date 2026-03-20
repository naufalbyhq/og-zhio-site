"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { DEFAULT_PRESET, PRESETS, type ContentMode, type PresetId } from "@/lib/presets";

const THEMES = [
  { id: "midnight", label: "Midnight Teal" },
  { id: "aurora", label: "Aurora Glass" },
  { id: "sunset", label: "Sunset Ember" },
  { id: "mono", label: "Mono Steel" },
] as const;

export default function Home() {
  const [mode, setMode] = useState<ContentMode>("quote");
  const [presetId, setPresetId] = useState<PresetId>(DEFAULT_PRESET);
  const [theme, setTheme] = useState<(typeof THEMES)[number]["id"]>("midnight");
  const [title, setTitle] = useState("Quote of the day");
  const [author, setAuthor] = useState("zhio.site");
  const [content, setContent] = useState(
    "Make your message visible in one frame, so people remember it in one glance.",
  );

  const selectedPreset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];

  const imageUrl = useMemo(() => {
    const params = new URLSearchParams({
      mode,
      preset: presetId,
      theme,
      title,
      author,
      content,
    });

    return `/api/image?${params.toString()}`;
  }, [author, content, mode, presetId, theme, title]);

  const downloadUrl = `${imageUrl}&download=1`;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,#152a4a_0%,#070b14_58%,#020409_100%)] text-slate-100">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="mb-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/90">zhio utility lab</p>
            <h1 className="font-serif text-3xl leading-tight text-white md:text-4xl">
              OpenGraph and Quote Image Generator
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Paste text, quotes, or code, then export image assets ready for Twitter, LinkedIn, and blog headers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Content Mode</span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as ContentMode)}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                <option value="text">Text</option>
                <option value="quote">Quote</option>
                <option value="code">Code</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Preset</span>
              <select
                value={presetId}
                onChange={(event) => setPresetId(event.target.value as PresetId)}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.width}x{preset.height})
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-1 text-sm md:col-span-2">
              <legend className="text-slate-300">Theme</legend>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {THEMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.12em] transition ${
                      theme === item.id
                        ? "border-cyan-300 bg-cyan-200/15 text-cyan-100"
                        : "border-white/15 bg-white/5 text-slate-300 hover:border-cyan-500/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={700}
                rows={7}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm leading-6 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-300">Author / Footer</span>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={60}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={downloadUrl}
              className="inline-flex items-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
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

        <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur lg:p-5">
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

          <p className="mt-3 text-xs text-slate-400">
            Tip: for code snippets, keep lines short for clean mobile previews.
          </p>
        </section>
      </main>
    </div>
  );
}
