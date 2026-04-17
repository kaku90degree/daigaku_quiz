import type { ScoreRecord, Genre, Difficulty } from "@/types";

const STORAGE_KEY = "daigaku-quiz-history";
const MAX_RECORDS = 50;

export function saveScore(
  genre: Genre,
  difficulty: Difficulty,
  score: number,
  total: number
): void {
  const record: ScoreRecord = {
    id: crypto.randomUUID(),
    genre,
    difficulty,
    score,
    total,
    playedAt: new Date().toISOString(),
  };

  const history = loadHistory();
  history.unshift(record);
  const trimmed = history.slice(0, MAX_RECORDS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage が使えない環境（プライベートブラウズ等）では無視
  }
}

export function loadHistory(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreRecord[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
