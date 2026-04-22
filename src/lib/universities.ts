import type { Question } from "@/types";

let cache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cache) return cache;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/questions.json`);
  cache = (await res.json()) as Question[];
  return cache;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
