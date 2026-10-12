# Artist Network App

アーティスト名を入力すると Last.fm API で関連アーティストを取得し、放射状のネットワーク図として表示する Web アプリ。中心のアーティストや関連アーティストをタップすると、そのアーティストが新しい中心になります。

## 技術構成

- React + Vite
- 可視化: d3-force(物理演算のみ)+ 自作 SVG 描画
- 外部 API: Last.fm(`artist.search` / `artist.getSimilar`)。API キーを隠すため、ブラウザからは直接呼ばず、自前の中継 API(Cloudflare Worker)経由で呼ぶ
- ホスティング: Cloudflare Workers(静的アセット付き)。`@cloudflare/vite-plugin` で `npm run dev` / ビルドにフロントと Worker を統合

## セットアップ

```bash
npm install
cp .env.example .env   # LASTFM_API_KEY に Last.fm の API キーを設定
npm run dev
```

Last.fm の API キーは https://www.last.fm/api/account/create で取得できます。`.env` は git 管理外で、キーは Worker だけが読みます(`VITE_` を付けないので、ブラウザ用のバンドルには入りません)。`.dev.vars` を使う場合は `.env` より優先されます(どちらも `.gitignore` 済み)。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動(フロントと Worker の両方がローカルで動く) |
| `npm run build` | 本番ビルド(`dist/client` = 静的アセット、`dist/<名前>` = Worker)。ビルド後に、プレビュー用にコピーされたローカルのキー(`dist/<名前>/.dev.vars`)を自動で削除 |
| `npm run preview` | ビルド結果を Workers ランタイムでプレビュー(キーを削除済みのため `/api/` は 500。API は `npm run dev` で確認) |

## 設計メモ

- 表示する関連アーティスト数: `src/config.js` の `RELATED_COUNT`(初期値 15。`getSimilar` の limit に使用)
- 中心からの距離: `match` を min-max 正規化したうえで平方根(`DISTANCE_CURVE = 0.5`)を通し、楕円半径に対する割合 `MIN_RADIUS_RATIO`〜`MAX_RADIUS_RATIO`(`src/config.js`)に変換。関連度が高いほど近い
- 配置は画面に合わせた楕円: 入力欄(`INPUT_BAR_HEIGHT` + セーフエリア)を除いた領域に収め、`MAX_ASPECT`(初期値 1.5)で引き伸ばしを制限。自作の `forceEllipseRadial` で楕円に引き寄せ、ラベルは画面内・入力欄の上に収める。ウィンドウサイズ変更時に再計算
- 角度: 円周を表示数で等分したスロットに、順位をシャッフルして割り当て(中心アーティスト名をシードにした疑似乱数なので、同じ検索は常に同じ配置)。スロット内のゆらぎは `ANGLE_JITTER`(0〜0.8)、距離のゆらぎは `DISTANCE_JITTER`(0〜0.1)
- タップ領域: 各ノードの点の外側に透明な円(`HIT_RADIUS` = 22px)とラベル全体の透明な矩形を重ねる。領域が重なる場合は、最前面ではなく点またはラベルの中心が最も近いノードを選ぶ(`src/lib/hitTest.js`)
- ノード識別子は `name`
- 線は中心 → 周辺のみ描画(周辺同士の関連線は描画しない。デザイン上シンプルにするため)
- API 呼び出しは検索ごとに `getSimilar` 1 回。検索中はローディング表示。通信に失敗したときは「読み込めませんでした。もう一度お試しください」を表示
- `RELATED_COUNT` は中継 API の上限(50)以内にすること

## 中継 API(`worker/index.js`)

| エンドポイント | 内容 |
| --- | --- |
| `GET /api/search?q=...` | `artist.search`(サジェスト用)。`{ "artists": ["名前", ...] }` |
| `GET /api/similar?artist=...&limit=...` | `artist.getSimilar`。`{ "artists": [{ "name", "match" }, ...] }` |

- 入力検証: `q` / `artist` は空不可・100 文字以内、`limit` は 1〜50 の整数(省略時 10)。不正は 400。GET 以外は 405。
- Last.fm のエラー・不正なレスポンスは 502、タイムアウト(8 秒)は 504。応答・エラー・ログにキーは含めない。
- 成功時は `Cache-Control: public, max-age=3600`(エラーは `no-store`)。`wrangler.jsonc` の `cache.enabled` で Workers Cache を有効にし、同じ URL への再リクエストは Worker を実行せずエッジのキャッシュから返す。
- `/api/*` 以外のリクエストは静的アセットを返す(`assets.run_worker_first` で `/api/*` だけ Worker を先に実行)。

## デプロイ(Cloudflare Workers)

1. `npx wrangler secret put LASTFM_API_KEY` で本番のキーを登録(またはダッシュボードの Workers & Pages → 対象の Worker → Settings → Variables and Secrets で Secret として追加)。
2. `npm run build && npx wrangler deploy`(ビルド出力の `dist/<名前>/wrangler.json` が使われる)。
