import type { Genre, Difficulty } from "@/types";

const APP_URL = "https://daigaku-quiz.vercel.app";

const GENRE_LABELS: Record<Genre, string> = {
  "owner-type": "設置者区分",
  faculty: "設置学部",
  "founded-year": "設立年",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "易",
  medium: "中",
  hard: "難",
};

export function buildShareText(
  genre: Genre,
  difficulty: Difficulty,
  score: number,
  total: number
): string {
  const pct = Math.round((score / total) * 100);
  return [
    `大学クイズ（${GENRE_LABELS[genre]}・${DIFFICULTY_LABELS[difficulty]}）に挑戦！`,
    `${score}/${total}問正解（正答率${pct}%）`,
    `あなたも試してみて！`,
    APP_URL,
    "#大学クイズ",
  ].join("\n");
}

export async function shareNative(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    await navigator.share({ text });
    return true;
  } catch {
    return false;
  }
}

export function shareToX(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function shareToLine(text: string): void {
  const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
