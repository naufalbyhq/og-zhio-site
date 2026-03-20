import { ImageResponse } from "next/og";
import { getPresetById, type ContentMode } from "@/lib/presets";

export const runtime = "edge";

const MAX_TEXT = 700;
const MAX_TITLE = 80;
const MAX_AUTHOR = 60;

function clean(input: string | null, max: number) {
  const normalized = (input ?? "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, max);
}

function gradientByTheme(theme: string | null) {
  switch (theme) {
    case "aurora":
      return "linear-gradient(135deg, #0d1726 0%, #123b50 45%, #1d8f8a 100%)";
    case "sunset":
      return "linear-gradient(130deg, #24120a 0%, #7a2e1f 45%, #f58a36 100%)";
    case "mono":
      return "linear-gradient(135deg, #0f1012 0%, #1f242a 100%)";
    default:
      return "linear-gradient(130deg, #111827 0%, #1f2937 40%, #0f766e 100%)";
  }
}

function contentStyles(mode: ContentMode) {
  if (mode === "code") {
    return {
      fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      fontSize: 40,
      lineHeight: 1.4,
      whiteSpace: "pre-wrap" as const,
      letterSpacing: "-0.01em",
    };
  }

  return {
    fontFamily: "Georgia, ui-serif, serif",
    fontSize: mode === "quote" ? 58 : 50,
    lineHeight: 1.22,
    letterSpacing: "-0.02em",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preset = getPresetById(searchParams.get("preset"));

  const mode = (searchParams.get("mode") ?? "quote") as ContentMode;
  const safeMode: ContentMode = ["text", "quote", "code"].includes(mode)
    ? mode
    : "quote";

  const title = clean(searchParams.get("title"), MAX_TITLE);
  const author = clean(searchParams.get("author"), MAX_AUTHOR);
  const rawContent = clean(searchParams.get("content"), MAX_TEXT);
  const content = rawContent || "Your words, ready to share beautifully.";
  const theme = searchParams.get("theme");

  const background = gradientByTheme(theme);
  const edgePadding = preset.width >= 1900 ? 120 : 80;
  const cardInset = preset.width >= 1900 ? 52 : 34;
  const tone = safeMode === "code" ? "#7dd3fc" : "#fda4af";

  const filename = `zhio-${preset.id}-${safeMode}.png`;
  const asAttachment = searchParams.get("download") === "1";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background,
          color: "#f8fafc",
          padding: edgePadding,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: cardInset,
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(2,6,23,0.85) 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "space-between",
            gap: 26,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                fontSize: 26,
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.82,
              }}
            >
              Zhio Creator Utility
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 22,
                opacity: 0.85,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: tone }} />
              <span>{preset.width} x {preset.height}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {title ? (
              <div
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: safeMode === "code" ? 34 : 30,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "rgba(226,232,240,0.85)",
                }}
              >
                {title}
              </div>
            ) : null}

            <div style={contentStyles(safeMode)}>
              {safeMode === "quote" ? `“${content}”` : content}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 24,
                letterSpacing: "0.03em",
                color: "rgba(224,231,255,0.88)",
              }}
            >
              {author ? `- ${author}` : "- Crafted for sharing"}
            </div>

            <div
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 21,
                color: "rgba(191,219,254,0.86)",
              }}
            >
              {`${safeMode.toUpperCase()} MODE`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: preset.width,
      height: preset.height,
      headers: {
        "content-disposition": asAttachment
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
      },
    },
  );
}
