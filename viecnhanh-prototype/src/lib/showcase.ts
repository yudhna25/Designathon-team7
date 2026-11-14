// Showcase imagery for fictional companies and demo people. Codex fills public/showcase/manifest.json;
// anything missing falls back to initials, so a half-finished manifest never breaks a screen.
import manifest from "../../public/showcase/manifest.json";

type Manifest = { logos?: Record<string, string>; covers?: Record<string, string>; avatars?: Record<string, string>; gallery?: Record<string, string[]> };
const m = manifest as Manifest;

export const SHOWCASE = {
  logos: m.logos ?? {},
  covers: m.covers ?? {},
  avatars: m.avatars ?? {},
  gallery: m.gallery ?? {},
};
