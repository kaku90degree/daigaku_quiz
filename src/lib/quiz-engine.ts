import type { Question, Genre, Difficulty } from "@/types";
import { shuffle } from "./universities";

const QUESTION_COUNT = 10;

export function generateQuiz(
  genre: Genre,
  difficulty: Difficulty,
  allQuestions: Question[]
): Question[] {
  const pool = allQuestions.filter(
    (q) => q.genre === genre && q.difficulty === difficulty
  );
  return shuffle(pool)
    .slice(0, QUESTION_COUNT)
    .map((q) => ({ ...q, choices: shuffle([...q.choices]) }));
}
