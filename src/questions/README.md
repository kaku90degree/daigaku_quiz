# クイズ問題ソースファイル

このディレクトリは **人手で編集・追加できる問題ソース** です。

## ファイル構成

| ファイル | 内容 |
|---------|------|
| `owner-type.json` | 設置者区分ジャンルの問題 |
| `faculty.json` | 設置学部ジャンルの問題 |
| `founded-year.json` | 設立年ジャンルの問題 |

## ビルド方法

```bash
# 文科省ExcelからMEXTデータ由来の問題を再生成（開発者が手動実行）
npm run parse-mext

# 全ソースを結合して public/data/questions.json を生成
npm run generate-questions
```

## 問題の追加方法

各 JSON ファイルに以下の形式でオブジェクトを追加するだけです。

```json
{
  "id": "manual-001-owner",
  "genre": "owner-type",
  "difficulty": "easy",
  "text": "「東京大学」の設置区分は何ですか？",
  "choices": ["国立", "公立", "私立"],
  "correctAnswer": "国立",
  "explanation": "東京大学は国立大学です（東京都）。",
  "universityId": ""
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | string | 一意なID。`manual-{連番}-{genre}` 形式を推奨 |
| `genre` | `"owner-type"` \| `"faculty"` \| `"founded-year"` | ジャンル |
| `difficulty` | `"easy"` \| `"medium"` \| `"hard"` | 難易度 |
| `text` | string | 問題文 |
| `choices` | string[4] | 選択肢（4つ）。順番はプレイ時にシャッフルされる |
| `correctAnswer` | string | `choices` のいずれかと完全一致する正解 |
| `explanation` | string | 回答後に表示される解説 |
| `universityId` | string | 文科省学校コード（手動追加時は `""` でよい） |

### 難易度の基準

| 難易度 | 対象大学 |
|--------|---------|
| `easy` | 旧帝大・早慶・MARCH・関関同立など全国的に知名度の高い大学 |
| `medium` | 全国的に知られた国立・公立・有名私立大学 |
| `hard` | 地方大学・専門分野特化大学を含む全大学 |

## データソースについて

- `owner-type.json` / `faculty.json` の大半は `npm run parse-mext` で自動生成されます
- `founded-year.json` は手動管理（文科省データに設立年の情報がないため）
- 自動生成されたエントリを手動で修正しても、次回 `parse-mext` 実行時に同じIDのエントリは上書きされます
- 手動追加した `id` が `manual-` で始まるエントリは自動生成と衝突しません
