import type { University, Question, Genre, Difficulty } from "@/types";
import { filterByDifficulty, shuffle, pickRandom } from "./universities";

const OWNER_TYPE_LABELS: Record<string, string> = {
  national: "国立",
  public: "公立",
  private: "私立",
};

// 全学部のマスターリスト（設置学部クイズで「ない学部」として使う）
const ALL_FACULTIES = [
  "法学部", "医学部", "工学部", "文学部", "理学部", "農学部",
  "経済学部", "教育学部", "薬学部", "歯学部", "看護学部", "商学部",
  "経営学部", "社会学部", "外国語学部", "国際学部", "情報学部",
  "芸術学部", "観光学部", "体育学部", "神学部", "水産学部",
  "獣医学部", "建築学部", "デザイン学部", "福祉学部",
];

// ----------------------------------------------------------------
// ジャンル別問題生成
// ----------------------------------------------------------------

function generateOwnerTypeQuestion(
  university: University,
  _all: University[]
): Question {
  const correct = OWNER_TYPE_LABELS[university.ownerType];
  const wrong = Object.values(OWNER_TYPE_LABELS).filter((v) => v !== correct);
  const choices = shuffle([correct, ...wrong]);

  return {
    id: `${university.id}-owner`,
    genre: "owner-type",
    text: `「${university.name}」の設置区分は何ですか？`,
    choices,
    correctAnswer: correct,
    explanation: `${university.name}は${correct}大学です（${university.prefecture}、${university.foundedYear}年設立）。`,
    universityId: university.id,
  };
}

function generateFacultyQuestion(
  university: University,
  all: University[]
): Question | null {
  if (university.faculties.length < 3) return null;

  // 正解 = 「この大学にない学部」
  const otherFaculties = all
    .filter((u) => u.id !== university.id)
    .flatMap((u) => u.faculties);
  const candidates = ALL_FACULTIES.filter(
    (f) => !university.faculties.includes(f) && otherFaculties.includes(f)
  );
  if (candidates.length === 0) return null;

  const correct = pickRandom(candidates, 1)[0];
  // 誤選択肢 = 実際にある学部から3つ
  const wrongChoices = pickRandom(university.faculties, Math.min(3, university.faculties.length));
  const choices = shuffle([correct, ...wrongChoices]);

  return {
    id: `${university.id}-faculty`,
    genre: "faculty",
    text: `「${university.name}」に設置されていない学部はどれ？`,
    choices,
    correctAnswer: correct,
    explanation: `${university.name}には${correct}は設置されていません。設置学部: ${university.faculties.join("・")}。`,
    universityId: university.id,
  };
}

function generateFoundedYearQuestion(
  university: University,
  all: University[]
): Question {
  const correct = String(university.foundedYear);

  // 他大学の設立年から3択を選ぶ（近い年代を優先）
  const otherYears = all
    .filter((u) => u.id !== university.id && u.foundedYear !== university.foundedYear)
    .map((u) => u.foundedYear)
    .sort((a, b) => Math.abs(a - university.foundedYear) - Math.abs(b - university.foundedYear));

  const uniqueOtherYears = [...new Set(otherYears)];
  const wrongPool = uniqueOtherYears.slice(0, 10);

  // 足りなければ ±10〜30年でランダム生成
  while (wrongPool.length < 3) {
    const offset = (Math.floor(Math.random() * 3) + 1) * 10 * (Math.random() < 0.5 ? 1 : -1);
    const candidate = university.foundedYear + offset;
    if (!wrongPool.includes(candidate) && candidate > 1800 && candidate <= new Date().getFullYear()) {
      wrongPool.push(candidate);
    }
  }

  const wrongChoices = pickRandom(wrongPool, 3).map(String);
  const choices = shuffle([correct, ...wrongChoices]);

  return {
    id: `${university.id}-year`,
    genre: "founded-year",
    text: `「${university.name}」の設立年はいつ頃ですか？`,
    choices,
    correctAnswer: correct,
    explanation: `${university.name}は${university.foundedYear}年に設立されました（${university.prefecture}・${OWNER_TYPE_LABELS[university.ownerType]}）。`,
    universityId: university.id,
  };
}

// ----------------------------------------------------------------
// セッション生成
// ----------------------------------------------------------------

const QUESTION_COUNT = 10;

export function generateQuiz(
  genre: Genre,
  difficulty: Difficulty,
  allUniversities: University[]
): Question[] {
  const pool = filterByDifficulty(allUniversities, difficulty);
  const candidates = shuffle(pool);

  const questions: Question[] = [];

  for (const university of candidates) {
    if (questions.length >= QUESTION_COUNT) break;

    let q: Question | null = null;
    if (genre === "owner-type") {
      q = generateOwnerTypeQuestion(university, allUniversities);
    } else if (genre === "faculty") {
      q = generateFacultyQuestion(university, allUniversities);
    } else if (genre === "founded-year") {
      q = generateFoundedYearQuestion(university, allUniversities);
    }

    if (q) questions.push(q);
  }

  return questions;
}
