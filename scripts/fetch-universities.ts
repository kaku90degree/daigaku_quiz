/**
 * 大学データ取得スクリプト
 *
 * 実行方法: npm run fetch-data
 *
 * NIAD_API_KEY が .env.local に設定されている場合:
 *   大学ポートレートAPIで補完データを取得して結合する（将来拡張）
 * 設定されていない場合:
 *   内蔵の厳選データ（約80大学）を使用する
 *
 * 出力: public/data/universities.json
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import type { University } from "../src/types/index.js";

dotenv.config({ path: ".env.local" });

// ----------------------------------------------------------------
// 内蔵厳選データ
// ----------------------------------------------------------------

const EMBEDDED_UNIVERSITIES: University[] = [
  // ===================== 易（旧帝大・有名国立） =====================
  {
    id: "univ-001",
    name: "東京大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "薬学部"],
    foundedYear: 1877,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-002",
    name: "京都大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "薬学部"],
    foundedYear: 1897,
    prefecture: "京都府",
    difficulty: "easy",
  },
  {
    id: "univ-003",
    name: "大阪大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "歯学部", "薬学部", "経済学部", "人間科学部", "外国語学部", "基礎工学部"],
    foundedYear: 1931,
    prefecture: "大阪府",
    difficulty: "easy",
  },
  {
    id: "univ-004",
    name: "東北大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "歯学部", "薬学部"],
    foundedYear: 1907,
    prefecture: "宮城県",
    difficulty: "easy",
  },
  {
    id: "univ-005",
    name: "名古屋大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "情報学部"],
    foundedYear: 1939,
    prefecture: "愛知県",
    difficulty: "easy",
  },
  {
    id: "univ-006",
    name: "北海道大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "歯学部", "薬学部", "獣医学部", "水産学部"],
    foundedYear: 1876,
    prefecture: "北海道",
    difficulty: "easy",
  },
  {
    id: "univ-007",
    name: "九州大学",
    ownerType: "national",
    faculties: ["法学部", "医学部", "工学部", "文学部", "理学部", "農学部", "経済学部", "教育学部", "歯学部", "薬学部", "芸術工学部", "共創学部"],
    foundedYear: 1911,
    prefecture: "福岡県",
    difficulty: "easy",
  },
  {
    id: "univ-008",
    name: "東京工業大学",
    ownerType: "national",
    faculties: ["理学院", "工学院", "物質理工学院", "情報理工学院", "生命理工学院", "環境・社会理工学院"],
    foundedYear: 1881,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-009",
    name: "一橋大学",
    ownerType: "national",
    faculties: ["法学部", "商学部", "経済学部", "社会学部"],
    foundedYear: 1875,
    prefecture: "東京都",
    difficulty: "easy",
  },
  // ===================== 易（有名私立） =====================
  {
    id: "univ-010",
    name: "早稲田大学",
    ownerType: "private",
    faculties: ["政治経済学部", "法学部", "商学部", "文学部", "文化構想学部", "教育学部", "社会科学部", "人間科学部", "スポーツ科学部", "国際教養学部", "基幹理工学部", "創造理工学部", "先進理工学部"],
    foundedYear: 1882,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-011",
    name: "慶應義塾大学",
    ownerType: "private",
    faculties: ["法学部", "医学部", "商学部", "文学部", "経済学部", "理工学部", "総合政策学部", "環境情報学部", "看護医療学部", "薬学部"],
    foundedYear: 1858,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-012",
    name: "上智大学",
    ownerType: "private",
    faculties: ["法学部", "文学部", "経済学部", "外国語学部", "総合人間科学部", "神学部", "理工学部", "国際教養学部"],
    foundedYear: 1913,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-013",
    name: "明治大学",
    ownerType: "private",
    faculties: ["法学部", "商学部", "政治経済学部", "文学部", "理工学部", "農学部", "経営学部", "情報コミュニケーション学部", "国際日本学部", "総合数理学部"],
    foundedYear: 1881,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-014",
    name: "立教大学",
    ownerType: "private",
    faculties: ["法学部", "文学部", "経済学部", "観光学部", "社会学部", "理学部", "コミュニティ福祉学部", "経営学部", "現代心理学部", "異文化コミュニケーション学部"],
    foundedYear: 1874,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-015",
    name: "中央大学",
    ownerType: "private",
    faculties: ["法学部", "経済学部", "商学部", "文学部", "理工学部", "総合政策学部", "国際経営学部", "国際情報学部"],
    foundedYear: 1885,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-016",
    name: "法政大学",
    ownerType: "private",
    faculties: ["法学部", "文学部", "経済学部", "社会学部", "経営学部", "工学部", "現代福祉学部", "国際文化学部", "人間環境学部", "キャリアデザイン学部", "情報科学部", "デザイン工学部", "スポーツ健康学部"],
    foundedYear: 1880,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-017",
    name: "青山学院大学",
    ownerType: "private",
    faculties: ["文学部", "教育人間科学部", "経済学部", "法学部", "経営学部", "国際政治経済学部", "総合文化政策学部", "理工学部", "社会情報学部", "地球社会共生学部", "コミュニティ人間科学部"],
    foundedYear: 1874,
    prefecture: "東京都",
    difficulty: "easy",
  },
  {
    id: "univ-018",
    name: "同志社大学",
    ownerType: "private",
    faculties: ["法学部", "文学部", "経済学部", "商学部", "政策学部", "文化情報学部", "理工学部", "生命医科学部", "社会学部", "グローバルコミュニケーション学部", "グローバル地域文化学部", "心理学部", "スポーツ健康科学部"],
    foundedYear: 1875,
    prefecture: "京都府",
    difficulty: "easy",
  },
  {
    id: "univ-019",
    name: "立命館大学",
    ownerType: "private",
    faculties: ["法学部", "産業社会学部", "文学部", "経済学部", "経営学部", "理工学部", "政策科学部", "国際関係学部", "映像学部", "生命科学部", "薬学部", "情報理工学部", "総合心理学部", "グローバル教養学部"],
    foundedYear: 1900,
    prefecture: "京都府",
    difficulty: "easy",
  },
  {
    id: "univ-020",
    name: "関西大学",
    ownerType: "private",
    faculties: ["法学部", "文学部", "経済学部", "商学部", "社会学部", "政策創造学部", "外国語学部", "人間健康学部", "総合情報学部", "社会安全学部", "システム理工学部", "環境都市工学部", "化学生命工学部"],
    foundedYear: 1886,
    prefecture: "大阪府",
    difficulty: "easy",
  },
  {
    id: "univ-021",
    name: "関西学院大学",
    ownerType: "private",
    faculties: ["神学部", "文学部", "社会学部", "法学部", "経済学部", "商学部", "理学部", "工学部", "総合政策学部", "人間福祉学部", "国際学部", "教育学部", "建築学部"],
    foundedYear: 1889,
    prefecture: "兵庫県",
    difficulty: "easy",
  },
  // ===================== 中（全国的に知られた大学） =====================
  {
    id: "univ-030",
    name: "筑波大学",
    ownerType: "national",
    faculties: ["人文・文化学群", "社会・国際学群", "人間学群", "生命環境学群", "理工学群", "情報学群", "医学群", "体育専門学群", "芸術専門学群"],
    foundedYear: 1973,
    prefecture: "茨城県",
    difficulty: "medium",
  },
  {
    id: "univ-031",
    name: "横浜国立大学",
    ownerType: "national",
    faculties: ["教育学部", "経済学部", "経営学部", "理工学部", "都市科学部"],
    foundedYear: 1949,
    prefecture: "神奈川県",
    difficulty: "medium",
  },
  {
    id: "univ-032",
    name: "千葉大学",
    ownerType: "national",
    faculties: ["文学部", "法政経学部", "教育学部", "理学部", "工学部", "薬学部", "医学部", "看護学部", "園芸学部", "国際教養学部"],
    foundedYear: 1949,
    prefecture: "千葉県",
    difficulty: "medium",
  },
  {
    id: "univ-033",
    name: "神戸大学",
    ownerType: "national",
    faculties: ["法学部", "経済学部", "経営学部", "文学部", "理学部", "工学部", "農学部", "医学部", "海事科学部", "国際人間科学部", "発達科学部"],
    foundedYear: 1949,
    prefecture: "兵庫県",
    difficulty: "medium",
  },
  {
    id: "univ-034",
    name: "広島大学",
    ownerType: "national",
    faculties: ["法学部", "経済学部", "文学部", "教育学部", "理学部", "工学部", "医学部", "歯学部", "薬学部", "生物生産学部", "総合科学部", "情報科学部"],
    foundedYear: 1949,
    prefecture: "広島県",
    difficulty: "medium",
  },
  {
    id: "univ-035",
    name: "岡山大学",
    ownerType: "national",
    faculties: ["法学部", "経済学部", "文学部", "教育学部", "理学部", "工学部", "医学部", "歯学部", "薬学部", "農学部", "環境理工学部"],
    foundedYear: 1949,
    prefecture: "岡山県",
    difficulty: "medium",
  },
  {
    id: "univ-036",
    name: "金沢大学",
    ownerType: "national",
    faculties: ["人間社会学域", "理工学域", "医薬保健学域"],
    foundedYear: 1949,
    prefecture: "石川県",
    difficulty: "medium",
  },
  {
    id: "univ-037",
    name: "東京農工大学",
    ownerType: "national",
    faculties: ["農学部", "工学部"],
    foundedYear: 1949,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-038",
    name: "電気通信大学",
    ownerType: "national",
    faculties: ["情報理工学域"],
    foundedYear: 1949,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-039",
    name: "東京外国語大学",
    ownerType: "national",
    faculties: ["言語文化学部", "国際社会学部", "国際日本学部"],
    foundedYear: 1897,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-040",
    name: "お茶の水女子大学",
    ownerType: "national",
    faculties: ["文教育学部", "理学部", "生活科学部"],
    foundedYear: 1875,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-041",
    name: "東京都立大学",
    ownerType: "public",
    faculties: ["法学部", "経済経営学部", "人文社会学部", "理学部", "都市環境学部", "システムデザイン学部", "健康福祉学部"],
    foundedYear: 1949,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-042",
    name: "大阪公立大学",
    ownerType: "public",
    faculties: ["文学部", "法学部", "経済学部", "商学部", "理学部", "工学部", "農学部", "医学部", "看護学部", "現代システム科学域", "生活科学部"],
    foundedYear: 2022,
    prefecture: "大阪府",
    difficulty: "medium",
  },
  {
    id: "univ-043",
    name: "横浜市立大学",
    ownerType: "public",
    faculties: ["国際教養学部", "国際商学部", "理学部", "データサイエンス学部", "医学部", "看護学部"],
    foundedYear: 1949,
    prefecture: "神奈川県",
    difficulty: "medium",
  },
  {
    id: "univ-044",
    name: "名古屋市立大学",
    ownerType: "public",
    faculties: ["経済学部", "人文社会学部", "芸術工学部", "理学部", "医学部", "薬学部", "看護学部", "データサイエンス学部"],
    foundedYear: 1950,
    prefecture: "愛知県",
    difficulty: "medium",
  },
  {
    id: "univ-050",
    name: "日本大学",
    ownerType: "private",
    faculties: ["法学部", "文理学部", "経済学部", "商学部", "芸術学部", "国際関係学部", "理工学部", "生産工学部", "工学部", "医学部", "歯学部", "松戸歯学部", "薬学部", "生物資源科学部", "スポーツ科学部", "危機管理学部", "社会学部"],
    foundedYear: 1889,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-051",
    name: "東洋大学",
    ownerType: "private",
    faculties: ["文学部", "経済学部", "経営学部", "法学部", "社会学部", "国際学部", "国際観光学部", "情報連携学部", "福祉社会デザイン学部", "健康スポーツ科学部", "理工学部", "総合情報学部", "生命科学部", "食環境科学部", "生体医工学部"],
    foundedYear: 1887,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-052",
    name: "駒澤大学",
    ownerType: "private",
    faculties: ["仏教学部", "文学部", "経済学部", "法学部", "経営学部", "医療健康科学部", "グローバル・メディア・スタディーズ学部"],
    foundedYear: 1882,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-053",
    name: "専修大学",
    ownerType: "private",
    faculties: ["経済学部", "法学部", "経営学部", "商学部", "文学部", "人間科学部", "国際コミュニケーション学部", "ネットワーク情報学部"],
    foundedYear: 1880,
    prefecture: "東京都",
    difficulty: "medium",
  },
  {
    id: "univ-054",
    name: "近畿大学",
    ownerType: "private",
    faculties: ["法学部", "経済学部", "経営学部", "理工学部", "建築学部", "薬学部", "文芸学部", "総合社会学部", "国際学部", "農学部", "医学部", "生物理工学部", "工学部", "産業理工学部"],
    foundedYear: 1925,
    prefecture: "大阪府",
    difficulty: "medium",
  },
  {
    id: "univ-055",
    name: "龍谷大学",
    ownerType: "private",
    faculties: ["文学部", "経済学部", "経営学部", "法学部", "政策学部", "先端理工学部", "社会学部", "国際学部", "農学部", "心理学部"],
    foundedYear: 1639,
    prefecture: "京都府",
    difficulty: "medium",
  },
  // ===================== 難（地方・特色大学） =====================
  {
    id: "univ-070",
    name: "弘前大学",
    ownerType: "national",
    faculties: ["人文社会科学部", "教育学部", "医学部", "理工学部", "農学生命科学部"],
    foundedYear: 1949,
    prefecture: "青森県",
    difficulty: "hard",
  },
  {
    id: "univ-071",
    name: "秋田大学",
    ownerType: "national",
    faculties: ["国際資源学部", "教育文化学部", "理工学部", "医学部"],
    foundedYear: 1949,
    prefecture: "秋田県",
    difficulty: "hard",
  },
  {
    id: "univ-072",
    name: "山形大学",
    ownerType: "national",
    faculties: ["人文社会科学部", "地域教育文化学部", "理学部", "工学部", "農学部", "医学部"],
    foundedYear: 1949,
    prefecture: "山形県",
    difficulty: "hard",
  },
  {
    id: "univ-073",
    name: "福島大学",
    ownerType: "national",
    faculties: ["行政政策学類", "経済経営学類", "人間発達文化学類", "理工学群", "食農学類"],
    foundedYear: 1949,
    prefecture: "福島県",
    difficulty: "hard",
  },
  {
    id: "univ-074",
    name: "宇都宮大学",
    ownerType: "national",
    faculties: ["地域デザイン科学部", "国際学部", "共同教育学部", "工学部", "農学部", "データサイエンス経営学部"],
    foundedYear: 1949,
    prefecture: "栃木県",
    difficulty: "hard",
  },
  {
    id: "univ-075",
    name: "群馬大学",
    ownerType: "national",
    faculties: ["共同教育学部", "社会情報学部", "理工学部", "医学部"],
    foundedYear: 1949,
    prefecture: "群馬県",
    difficulty: "hard",
  },
  {
    id: "univ-076",
    name: "信州大学",
    ownerType: "national",
    faculties: ["人文学部", "教育学部", "経法学部", "理学部", "工学部", "農学部", "医学部", "繊維学部"],
    foundedYear: 1949,
    prefecture: "長野県",
    difficulty: "hard",
  },
  {
    id: "univ-077",
    name: "静岡大学",
    ownerType: "national",
    faculties: ["人文社会科学部", "教育学部", "情報学部", "理学部", "工学部", "農学部"],
    foundedYear: 1949,
    prefecture: "静岡県",
    difficulty: "hard",
  },
  {
    id: "univ-078",
    name: "三重大学",
    ownerType: "national",
    faculties: ["人文学部", "教育学部", "医学部", "工学部", "生物資源学部"],
    foundedYear: 1949,
    prefecture: "三重県",
    difficulty: "hard",
  },
  {
    id: "univ-079",
    name: "鳥取大学",
    ownerType: "national",
    faculties: ["地域学部", "医学部", "工学部", "農学部"],
    foundedYear: 1949,
    prefecture: "鳥取県",
    difficulty: "hard",
  },
  {
    id: "univ-080",
    name: "島根大学",
    ownerType: "national",
    faculties: ["法文学部", "教育学部", "医学部", "総合理工学部", "生物資源科学部"],
    foundedYear: 1949,
    prefecture: "島根県",
    difficulty: "hard",
  },
  {
    id: "univ-081",
    name: "愛媛大学",
    ownerType: "national",
    faculties: ["法文学部", "教育学部", "社会共創学部", "理学部", "工学部", "農学部", "医学部"],
    foundedYear: 1949,
    prefecture: "愛媛県",
    difficulty: "hard",
  },
  {
    id: "univ-082",
    name: "高知大学",
    ownerType: "national",
    faculties: ["人文社会科学部", "教育研究部", "理工学部", "農林海洋科学部", "医学部"],
    foundedYear: 1949,
    prefecture: "高知県",
    difficulty: "hard",
  },
  {
    id: "univ-083",
    name: "佐賀大学",
    ownerType: "national",
    faculties: ["文化教育学部", "経済学部", "医学部", "理工学部", "農学部", "芸術地域デザイン学部"],
    foundedYear: 1949,
    prefecture: "佐賀県",
    difficulty: "hard",
  },
  {
    id: "univ-084",
    name: "長崎大学",
    ownerType: "national",
    faculties: ["多文化社会学部", "教育学部", "経済学部", "医学部", "歯学部", "薬学部", "工学部", "環境科学部", "水産学部", "情報データ科学部"],
    foundedYear: 1949,
    prefecture: "長崎県",
    difficulty: "hard",
  },
  {
    id: "univ-085",
    name: "熊本大学",
    ownerType: "national",
    faculties: ["文学部", "教育学部", "法学部", "理学部", "医学部", "薬学部", "工学部", "情報融合学環"],
    foundedYear: 1949,
    prefecture: "熊本県",
    difficulty: "hard",
  },
  {
    id: "univ-086",
    name: "大分大学",
    ownerType: "national",
    faculties: ["経済学部", "教育学部", "理工学部", "医学部", "福祉健康科学部"],
    foundedYear: 1949,
    prefecture: "大分県",
    difficulty: "hard",
  },
  {
    id: "univ-087",
    name: "宮崎大学",
    ownerType: "national",
    faculties: ["教育学部", "地域資源創成学部", "工学部", "農学部", "医学部"],
    foundedYear: 1949,
    prefecture: "宮崎県",
    difficulty: "hard",
  },
  {
    id: "univ-088",
    name: "鹿児島大学",
    ownerType: "national",
    faculties: ["法文学部", "教育学部", "経済学部", "理学部", "医学部", "歯学部", "工学部", "農学部", "水産学部", "共同獣医学部"],
    foundedYear: 1949,
    prefecture: "鹿児島県",
    difficulty: "hard",
  },
  {
    id: "univ-089",
    name: "琉球大学",
    ownerType: "national",
    faculties: ["法文学部", "教育学部", "理学部", "医学部", "工学部", "農学部", "国際地域創造学部"],
    foundedYear: 1950,
    prefecture: "沖縄県",
    difficulty: "hard",
  },
  {
    id: "univ-090",
    name: "札幌医科大学",
    ownerType: "public",
    faculties: ["医学部", "保健医療学部"],
    foundedYear: 1950,
    prefecture: "北海道",
    difficulty: "hard",
  },
  {
    id: "univ-091",
    name: "会津大学",
    ownerType: "public",
    faculties: ["コンピュータ理工学部"],
    foundedYear: 1993,
    prefecture: "福島県",
    difficulty: "hard",
  },
  {
    id: "univ-092",
    name: "国際教養大学",
    ownerType: "public",
    faculties: ["国際教養学部"],
    foundedYear: 2004,
    prefecture: "秋田県",
    difficulty: "hard",
  },
  {
    id: "univ-093",
    name: "静岡文化芸術大学",
    ownerType: "public",
    faculties: ["文化政策学部", "デザイン学部"],
    foundedYear: 2000,
    prefecture: "静岡県",
    difficulty: "hard",
  },
  {
    id: "univ-094",
    name: "兵庫県立大学",
    ownerType: "public",
    faculties: ["国際商経学部", "社会情報科学部", "工学部", "理学部", "環境人間学部", "看護学部", "情報科学部"],
    foundedYear: 2004,
    prefecture: "兵庫県",
    difficulty: "hard",
  },
];

// ----------------------------------------------------------------
// NIAD API 補完（将来拡張用）
// ----------------------------------------------------------------

async function tryFetchFromNIAD(): Promise<University[]> {
  const apiKey = process.env.NIAD_API_KEY;
  if (!apiKey) {
    console.log("NIAD_API_KEY が未設定のため、内蔵データを使用します。");
    return [];
  }

  // TODO: NIAD API 本格実装
  // 現時点では空配列を返す（将来のAPIキー取得後に実装）
  console.log("NIAD_API_KEY を検出しました（将来の拡張ポイント）。");
  return [];
}

// ----------------------------------------------------------------
// メイン処理
// ----------------------------------------------------------------

async function main() {
  console.log("大学データ取得を開始します...");

  const niaDData = await tryFetchFromNIAD();

  // NIAD データで上書き（同じ id があれば）
  const niaDMap = new Map(niaDData.map((u) => [u.id, u]));
  const merged = EMBEDDED_UNIVERSITIES.map((u) => niaDMap.get(u.id) ?? u);

  // NIAD のみのデータを追加
  for (const u of niaDData) {
    if (!merged.find((m) => m.id === u.id)) {
      merged.push(u);
    }
  }

  const outputPath = path.join(process.cwd(), "public", "data", "universities.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), "utf-8");

  const counts = {
    easy: merged.filter((u) => u.difficulty === "easy").length,
    medium: merged.filter((u) => u.difficulty === "medium").length,
    hard: merged.filter((u) => u.difficulty === "hard").length,
  };

  console.log(`✓ ${merged.length} 件の大学データを出力しました`);
  console.log(`  易: ${counts.easy}件 / 中: ${counts.medium}件 / 難: ${counts.hard}件`);
  console.log(`  出力先: ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
