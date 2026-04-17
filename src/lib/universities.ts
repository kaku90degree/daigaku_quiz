import type { University, Difficulty } from "@/types";

let cache: University[] | null = null;

export async function loadUniversities(): Promise<University[]> {
  if (cache) return cache;
  const res = await fetch("/data/universities.json");
  cache = (await res.json()) as University[];
  return cache;
}

export function filterByDifficulty(
  universities: University[],
  difficulty: Difficulty
): University[] {
  if (difficulty === "hard") return universities;
  if (difficulty === "medium")
    return universities.filter((u) => u.difficulty !== "hard");
  return universities.filter((u) => u.difficulty === "easy");
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
