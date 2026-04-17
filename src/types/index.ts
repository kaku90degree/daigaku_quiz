// 設置者区分
export type OwnerType = "national" | "public" | "private";

// 難易度
export type Difficulty = "easy" | "medium" | "hard";

// クイズジャンル
export type Genre = "owner-type" | "faculty" | "founded-year";

// 大学マスターデータ
export type University = {
  id: string;
  name: string;
  ownerType: OwnerType;
  faculties: string[];
  foundedYear: number;
  prefecture: string;
  difficulty: Difficulty;
};

// クイズの1問
export type Question = {
  id: string;
  genre: Genre;
  text: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  universityId: string;
};

// クイズセッション（sessionStorage で保持）
export type QuizSession = {
  genre: Genre;
  difficulty: Difficulty;
  questions: Question[];
  currentIndex: number;
  answers: (string | null)[];
};

// セッション結果（結果ページに渡す）
export type QuizResult = {
  genre: Genre;
  difficulty: Difficulty;
  questions: Question[];
  answers: string[];
  score: number;
};

// スコア履歴（localStorage で保持）
export type ScoreRecord = {
  id: string;
  genre: Genre;
  difficulty: Difficulty;
  score: number;
  total: number;
  playedAt: string; // ISO 8601
};
