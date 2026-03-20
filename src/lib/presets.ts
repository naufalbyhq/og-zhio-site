export type PresetId =
  | "twitter-post"
  | "twitter-card"
  | "linkedin-post"
  | "og-standard"
  | "blog-hero";

export type ContentMode = "text" | "quote" | "code";

export type Preset = {
  id: PresetId;
  label: string;
  width: number;
  height: number;
  description: string;
};

export const PRESETS: Preset[] = [
  {
    id: "twitter-post",
    label: "Twitter Post",
    width: 1200,
    height: 675,
    description: "16:9 for in-feed sharing",
  },
  {
    id: "twitter-card",
    label: "Twitter Card",
    width: 1200,
    height: 600,
    description: "2:1 summary card format",
  },
  {
    id: "linkedin-post",
    label: "LinkedIn Post",
    width: 1200,
    height: 627,
    description: "1.91:1 feed image",
  },
  {
    id: "og-standard",
    label: "OG Standard",
    width: 1200,
    height: 630,
    description: "Universal blog/social OpenGraph",
  },
  {
    id: "blog-hero",
    label: "Blog Hero",
    width: 1920,
    height: 1080,
    description: "16:9 cover/header image",
  },
];

export const DEFAULT_PRESET: PresetId = "og-standard";

export function getPresetById(id: string | null): Preset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[3];
}
