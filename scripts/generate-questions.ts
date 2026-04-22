/**
 * 問題ビルドスクリプト
 *
 * 実行方法: npm run generate-questions
 *
 * src/questions/*.json を読み込み、
 * public/data/questions.json に結合して出力する。
 *
 * 問題を追加・修正するには src/questions/ 以下のファイルを直接編集してください。
 * 詳細は src/questions/README.md を参照。
 */

import * as fs from "fs";
import * as path from "path";
import type { Question } from "../src/types/index.js";

const GENRES = ["owner-type", "faculty", "founded-year"] as const;

function main() {
  const allQuestions: Question[] = [];

  for (const genre of GENRES) {
    const src = path.join(process.cwd(), "src", "questions", `${genre}.json`);
    if (!fs.existsSync(src)) {
      console.warn(`[skip] ${src} not found`);
      continue;
    }
    const questions: Question[] = JSON.parse(fs.readFileSync(src, "utf-8"));
    allQuestions.push(...questions);
    console.log(`  ${genre}: ${questions.length} 問読み込み`);
  }

  // ID 重複チェック
  const ids = allQuestions.map((q) => q.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    console.warn(`[warn] 重複ID: ${[...new Set(dupes)].join(", ")}`);
  }

  const outPath = path.join(process.cwd(), "public", "data", "questions.json");
  fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2), "utf-8");

  const diffs = ["easy", "medium", "hard"] as const;
  console.log(`\n生成完了: ${allQuestions.length} 問`);
  for (const g of GENRES) {
    for (const d of diffs) {
      const n = allQuestions.filter((q) => q.genre === g && q.difficulty === d).length;
      console.log(`  ${g} / ${d}: ${n} 問`);
    }
  }
}

main();
