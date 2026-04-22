/**
 * 問題静的生成スクリプト
 *
 * 実行方法: npm run generate-questions
 *
 * public/data/universities.json を読み込み、
 * 全大学 × 全ジャンルの問題を生成して public/data/questions.json に出力する。
 */

import * as fs from "fs";
import * as path from "path";
import type { University, Question, Genre } from "../src/types/index.js";

const OWNER_TYPE_LABELS: Record<string, string> = {
  national: "国立",
  public: "公立",
  private: "私立",
};

const ALL_FACULTIES = [
  "法学部", "医学部", "工学部", "文学部", "理学部", "農学部",
  "経済学部", "教育学部", "薬学部", "歯学部", "看護学部", "商学部",
  "経営学部", "社会学部", "外国語学部", "国際学部", "情報学部",
  "芸術学部", "観光学部", "体育学部", "神学部", "水産学部",
  "獣医学部", "建築学部", "デザイン学部", "福祉学部",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function generateOwnerTypeQuestion(u: University): Question {
  const correct = OWNER_TYPE_LABELS[u.ownerType];
  const wrong = Object.values(OWNER_TYPE_LABELS).filter((v) => v !== correct);
  return {
    id: `${u.id}-owner`,
    genre: "owner-type",
    difficulty: u.difficulty,
    text: `「${u.name}」の設置区分は何ですか？`,
    choices: shuffle([correct, ...wrong]),
    correctAnswer: correct,
    explanation: `${u.name}は${correct}大学です（${u.prefecture}、${u.foundedYear}年設立）。`,
    universityId: u.id,
  };
}

function generateFacultyQuestion(u: University, all: University[]): Question | null {
  if (u.faculties.length < 3) return null;

  const otherFaculties = all
    .filter((x) => x.id !== u.id)
    .flatMap((x) => x.faculties);
  const candidates = ALL_FACULTIES.filter(
    (f) => !u.faculties.includes(f) && otherFaculties.includes(f)
  );
  if (candidates.length === 0) return null;

  const correct = pickRandom(candidates, 1)[0];
  const wrongChoices = pickRandom(u.faculties, Math.min(3, u.faculties.length));
  return {
    id: `${u.id}-faculty`,
    genre: "faculty",
    difficulty: u.difficulty,
    text: `「${u.name}」に設置されていない学部はどれ？`,
    choices: shuffle([correct, ...wrongChoices]),
    correctAnswer: correct,
    explanation: `${u.name}には${correct}は設置されていません。設置学部: ${u.faculties.join("・")}。`,
    universityId: u.id,
  };
}

function generateFoundedYearQuestion(u: University, all: University[]): Question {
  const correct = String(u.foundedYear);
  const otherYears = all
    .filter((x) => x.id !== u.id && x.foundedYear !== u.foundedYear)
    .map((x) => x.foundedYear)
    .sort((a, b) => Math.abs(a - u.foundedYear) - Math.abs(b - u.foundedYear));

  const uniqueOtherYears = [...new Set(otherYears)];
  const wrongPool = uniqueOtherYears.slice(0, 10);

  while (wrongPool.length < 3) {
    const offset = (Math.floor(Math.random() * 3) + 1) * 10 * (Math.random() < 0.5 ? 1 : -1);
    const candidate = u.foundedYear + offset;
    if (!wrongPool.includes(candidate) && candidate > 1800 && candidate <= new Date().getFullYear()) {
      wrongPool.push(candidate);
    }
  }

  const wrongChoices = pickRandom(wrongPool, 3).map(String);
  return {
    id: `${u.id}-year`,
    genre: "founded-year",
    difficulty: u.difficulty,
    text: `「${u.name}」の設立年はいつ頃ですか？`,
    choices: shuffle([correct, ...wrongChoices]),
    correctAnswer: correct,
    explanation: `${u.name}は${u.foundedYear}年に設立されました（${u.prefecture}・${OWNER_TYPE_LABELS[u.ownerType]}）。`,
    universityId: u.id,
  };
}

function main() {
  const jsonPath = path.join(process.cwd(), "public", "data", "universities.json");
  const universities: University[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const questions: Question[] = [];
  const genres: Genre[] = ["owner-type", "faculty", "founded-year"];

  for (const u of universities) {
    for (const genre of genres) {
      let q: Question | null = null;
      if (genre === "owner-type") q = generateOwnerTypeQuestion(u);
      else if (genre === "faculty") q = generateFacultyQuestion(u, universities);
      else if (genre === "founded-year") q = generateFoundedYearQuestion(u, universities);
      if (q) questions.push(q);
    }
  }

  const outPath = path.join(process.cwd(), "public", "data", "questions.json");
  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");

  // 件数サマリー
  const genres2 = ["owner-type", "faculty", "founded-year"] as const;
  const diffs = ["easy", "medium", "hard"] as const;
  console.log(`生成完了: ${questions.length} 問`);
  for (const g of genres2) {
    for (const d of diffs) {
      const count = questions.filter((q) => q.genre === g && q.difficulty === d).length;
      console.log(`  ${g} / ${d}: ${count} 問`);
    }
  }
}

main();
