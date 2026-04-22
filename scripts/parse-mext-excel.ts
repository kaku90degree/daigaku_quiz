/**
 * 文科省Excelパーサー
 *
 * 実行方法: npm run parse-mext
 *
 * datasets/ 以下の文科省Excelファイルを解析し、
 * src/questions/owner-type.json と src/questions/faculty.json を更新する。
 *
 * founded-year.json は文科省データに設立年情報がないため対象外。
 * 手動で src/questions/founded-year.json を編集してください。
 *
 * 注意:
 * - 私立大学のシートはキャンパス名を列記する形式のため学部名を取得できません。
 *   私立大学の faculty 問題は src/questions/faculty.json の既存データ（NIAD由来）を継続使用します。
 * - parse-mext 実行時に MEXT 由来（id が "F" で始まる）のエントリは上書きされます。
 * - "manual-" で始まる id のエントリは上書きされません。
 */

import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";
import type { Question, Difficulty } from "../src/types/index.js";

// ----------------------------------------------------------------
// 難易度マスター
// ----------------------------------------------------------------

const EASY_NAMES = new Set([
  // 旧帝大
  "北海道大学", "東北大学", "東京大学", "名古屋大学", "京都大学", "大阪大学", "九州大学",
  // 主要国立
  "一橋大学", "東京工業大学", "筑波大学", "神戸大学", "広島大学", "横浜国立大学",
  "千葉大学", "岡山大学", "金沢大学", "新潟大学", "熊本大学", "長崎大学",
  "鹿児島大学", "岐阜大学", "静岡大学", "三重大学", "愛媛大学",
  "信州大学", "富山大学", "弘前大学", "岩手大学", "山形大学", "福島大学",
  "茨城大学", "宇都宮大学", "群馬大学", "埼玉大学", "奈良女子大学",
  // 有名私立
  "早稲田大学", "慶應義塾大学", "上智大学",
  "明治大学", "青山学院大学", "立教大学", "中央大学", "法政大学",
  "同志社大学", "立命館大学", "関西大学", "関西学院大学",
  "東京理科大学", "学習院大学", "近畿大学", "日本大学",
  // 有名公立
  "東京都立大学", "大阪公立大学", "横浜市立大学", "名古屋市立大学",
]);

const MEDIUM_NAMES = new Set([
  // 国立（easyに入らないもの）は自動でmediumになる
  // 私立有名校追加
  "東洋大学", "専修大学", "駒澤大学", "東海大学",
  "龍谷大学", "京都産業大学", "甲南大学", "西南学院大学", "福岡大学",
  "東北学院大学", "北海学園大学", "獨協大学", "武蔵大学",
  "成蹊大学", "成城大学", "明治学院大学", "國學院大學", "武蔵野大学",
  "愛知大学", "中京大学", "名城大学", "南山大学",
  "立命館アジア太平洋大学", "国際基督教大学",
  "芝浦工業大学", "工学院大学", "東京電機大学", "東京都市大学",
  "関西外国語大学", "京都外国語大学",
  "広島修道大学", "松山大学",
]);

function getDifficulty(name: string, ownerType: "national" | "public" | "private"): Difficulty {
  if (EASY_NAMES.has(name)) return "easy";
  if (ownerType === "national") return "medium"; // 国立はeasyに入らなければmedium
  if (ownerType === "public") return "medium";   // 公立もmedium
  if (MEDIUM_NAMES.has(name)) return "medium";
  return "hard";
}

// ----------------------------------------------------------------
// 都道府県マスター
// ----------------------------------------------------------------

const PREFECTURE_PATTERN = new RegExp(
  `^(北海道|${[
    "青森", "岩手", "宮城", "秋田", "山形", "福島",
    "茨城", "栃木", "群馬", "埼玉", "千葉", "神奈川",
    "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜",
    "静岡", "愛知", "三重", "滋賀", "京都", "大阪", "兵庫",
    "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口",
    "徳島", "香川", "愛媛", "高知",
    "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
  ].map((p) => `${p}(?:都|道|府|県)?`).join("|")})`
);

function extractPrefecture(address: string): string {
  const m = address.match(PREFECTURE_PATTERN);
  return m ? m[1] : "";
}

// ----------------------------------------------------------------
// Excelシートパース
// ----------------------------------------------------------------

type UniversityData = {
  id: string;
  name: string;
  ownerType: "national" | "public" | "private";
  faculties: string[];
  prefecture: string;
};

function parseSheet(ws: XLSX.WorkSheet): UniversityData | null {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | null)[][];
  if (!rows[0]?.[1]) return null;

  const rawName = String(rows[0][1]);

  // 設置区分
  let ownerType: "national" | "public" | "private";
  if (rawName.startsWith("国立")) ownerType = "national";
  else if (rawName.startsWith("公立")) ownerType = "public";
  else ownerType = "private";

  // 大学名（設置区分と英語名を除去）
  const nameMatch = rawName.match(/^(?:国立|公立|私立)\s+(.+?)(?:[（(].+?[)）])?$/);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim().replace(/　/g, "").replace(/\s+/g, "");

  // 学校コード
  let id = "";
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i]?.[1];
    if (cell && String(cell) === "学校コード" && rows[i + 1]?.[1]) {
      id = String(rows[i + 1][1]);
      break;
    }
  }
  if (!id) return null;

  // 学部名と都道府県（学部・研究科所在地セクション）
  const faculties: string[] = [];
  let prefecture = "";
  let inSection = false;

  for (const row of rows) {
    const cell = row?.[1] ? String(row[1]) : "";
    if (cell.includes("学部・研究科所在地")) { inSection = true; continue; }
    if (inSection && (!row || row.every((c) => c == null || c === ""))) { break; }
    if (!inSection || !cell || cell === "名称") continue;

    // 学部名抽出（"学部" で終わるセグメント）
    const matches = cell.match(/[^\s・（）、]+学部/g);
    if (matches) {
      for (const m of matches) {
        if (!faculties.includes(m)) faculties.push(m);
      }
    }

    // 都道府県（最初の住所から取得）
    if (!prefecture && row[8]) {
      const pref = extractPrefecture(String(row[8]));
      if (pref) prefecture = pref;
    }
  }

  return { id, name, ownerType, faculties, prefecture };
}

// ----------------------------------------------------------------
// 問題生成
// ----------------------------------------------------------------

const OWNER_TYPE_LABELS: Record<string, string> = {
  national: "国立", public: "公立", private: "私立",
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

function buildOwnerTypeQuestion(u: UniversityData): Question {
  const correct = OWNER_TYPE_LABELS[u.ownerType];
  const wrong = Object.values(OWNER_TYPE_LABELS).filter((v) => v !== correct);
  const difficulty = getDifficulty(u.name, u.ownerType);
  const location = u.prefecture ? `${u.prefecture}` : "所在地不明";
  return {
    id: `${u.id}-owner`,
    genre: "owner-type",
    difficulty,
    text: `「${u.name}」の設置区分は何ですか？`,
    choices: shuffle([correct, ...wrong]),
    correctAnswer: correct,
    explanation: `${u.name}は${correct}大学です（${location}）。`,
    universityId: u.id,
  };
}

function buildFacultyQuestion(
  u: UniversityData,
  allFacultiesInData: Set<string>
): Question | null {
  if (u.faculties.length < 3) return null;

  const candidates = ALL_FACULTIES.filter(
    (f) => !u.faculties.includes(f) && allFacultiesInData.has(f)
  );
  if (candidates.length === 0) return null;

  const correct = shuffle(candidates)[0];
  const wrongChoices = shuffle(u.faculties).slice(0, 3);
  const difficulty = getDifficulty(u.name, u.ownerType);

  return {
    id: `${u.id}-faculty`,
    genre: "faculty",
    difficulty,
    text: `「${u.name}」に設置されていない学部はどれ？`,
    choices: shuffle([correct, ...wrongChoices]),
    correctAnswer: correct,
    explanation: `${u.name}には${correct}は設置されていません。設置学部: ${u.faculties.join("・")}。`,
    universityId: u.id,
  };
}

// ----------------------------------------------------------------
// ファイル処理
// ----------------------------------------------------------------

function processFile(filePath: string): UniversityData[] {
  const wb = XLSX.readFile(filePath);
  const results: UniversityData[] = [];
  for (const sheetName of wb.SheetNames) {
    const parsed = parseSheet(wb.Sheets[sheetName]);
    if (parsed) results.push(parsed);
  }
  return results;
}

// ----------------------------------------------------------------
// メイン
// ----------------------------------------------------------------

function main() {
  const datasetsDir = path.join(process.cwd(), "datasets");
  const filePatterns = ["_01.xlsx", "_02.xlsx", "_03-1.xlsx", "_03-2.xlsx", "_03-3.xlsx",
    "_03-4.xlsx", "_03-5.xlsx", "_03-6.xlsx", "_03-7.xlsx"];

  console.log("Excelファイルを解析中...");
  const allUniversities: UniversityData[] = [];

  for (const pattern of filePatterns) {
    const files = fs.readdirSync(datasetsDir).filter(
      (f) => f.endsWith(pattern) && !f.includes("Zone.Identifier")
    );
    for (const file of files) {
      const unis = processFile(path.join(datasetsDir, file));
      console.log(`  ${file}: ${unis.length} 校`);
      allUniversities.push(...unis);
    }
  }

  console.log(`\n合計: ${allUniversities.length} 校\n`);

  // 全学部セット（faculty問題の誤答選択肢生成に使用）
  const allFacultiesInData = new Set<string>();
  for (const u of allUniversities) {
    for (const f of u.faculties) allFacultiesInData.add(f);
  }

  // owner-type 問題生成（全大学）
  const ownerTypeQuestions: Question[] = allUniversities.map(buildOwnerTypeQuestion);

  // faculty 問題生成（国立・公立のみ — 私立はキャンパス名形式のため学部名取得不可）
  const nationalPublic = allUniversities.filter(
    (u) => u.ownerType === "national" || u.ownerType === "public"
  );
  const facultyQuestionsFromMext: Question[] = nationalPublic
    .map((u) => buildFacultyQuestion(u, allFacultiesInData))
    .filter((q): q is Question => q !== null);

  console.log(`owner-type 問題: ${ownerTypeQuestions.length} 問`);
  console.log(`faculty 問題 (国立・公立): ${facultyQuestionsFromMext.length} 問`);

  // ----------------------------------------------------------------
  // src/questions/owner-type.json を更新
  // "F" で始まるIDのエントリを今回の生成結果で置き換え。
  // "manual-" で始まるIDは保持。
  // ----------------------------------------------------------------
  const ownerTypeSrc = path.join(process.cwd(), "src", "questions", "owner-type.json");
  const existingOwnerType: Question[] = fs.existsSync(ownerTypeSrc)
    ? JSON.parse(fs.readFileSync(ownerTypeSrc, "utf-8"))
    : [];
  const manualOwnerType = existingOwnerType.filter((q) => q.id.startsWith("manual-"));
  const mergedOwnerType = [...ownerTypeQuestions, ...manualOwnerType];
  fs.writeFileSync(ownerTypeSrc, JSON.stringify(mergedOwnerType, null, 2), "utf-8");

  // ----------------------------------------------------------------
  // src/questions/faculty.json を更新
  // MEXT由来（国立・公立）で上書き + 既存の私立分（non-Fまたはmanual-）を保持
  // ----------------------------------------------------------------
  const facultySrc = path.join(process.cwd(), "src", "questions", "faculty.json");
  const existingFaculty: Question[] = fs.existsSync(facultySrc)
    ? JSON.parse(fs.readFileSync(facultySrc, "utf-8"))
    : [];
  // 既存のうち: F始まりかつ国立・公立のものはMEXTで置換、その他は保持
  const mextIds = new Set(facultyQuestionsFromMext.map((q) => q.id));
  const keptFaculty = existingFaculty.filter(
    (q) => !mextIds.has(q.id) && !(q.id.match(/^F1[02]/) && !q.id.startsWith("manual-"))
  );
  const mergedFaculty = [...facultyQuestionsFromMext, ...keptFaculty];
  fs.writeFileSync(facultySrc, JSON.stringify(mergedFaculty, null, 2), "utf-8");

  // サマリー
  const diffs = ["easy", "medium", "hard"] as const;
  const genres = ["owner-type", "faculty"] as const;
  console.log("\n--- 難易度別件数 ---");
  for (const g of genres) {
    const src = g === "owner-type" ? mergedOwnerType : mergedFaculty;
    for (const d of diffs) {
      const n = src.filter((q) => q.difficulty === d).length;
      console.log(`  ${g} / ${d}: ${n} 問`);
    }
  }
  console.log("\nfounded-year は src/questions/founded-year.json を手動管理してください。");
}

main();
