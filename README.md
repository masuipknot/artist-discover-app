# Artist Network App

アーティスト名を入力すると Last.fm API で関連アーティストを取得し、放射状のネットワーク図として表示する Web アプリ。中心のアーティストや関連アーティストをタップすると、そのアーティストが新しい中心になります。

## 技術構成

- React + Vite
- 可視化: d3-force(物理演算のみ)+ 自作 SVG 描画
- 外部 API: Last.fm(`artist.search` / `artist.getSimilar`)

## セットアップ

```bash
npm install
cp .env.example .env   # VITE_LASTFM_API_KEY に Last.fm の API キーを設定
npm run dev
```

Last.fm の API キーは https://www.last.fm/api/account/create で取得できます。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド(`dist/`) |
| `npm run preview` | ビルド結果のプレビュー |

## 設計メモ

- 表示する関連アーティスト数: `src/config.js` の `RELATED_COUNT`(初期値 15。`getSimilar` の limit に使用)
- 中心からの距離: `match` を min-max 正規化したうえで平方根(`DISTANCE_CURVE = 0.5`)を通し、楕円半径に対する割合 `MIN_RADIUS_RATIO`〜`MAX_RADIUS_RATIO`(`src/config.js`)に変換。関連度が高いほど近い
- 配置は画面に合わせた楕円: 入力欄(`INPUT_BAR_HEIGHT` + セーフエリア)を除いた領域に収め、`MAX_ASPECT`(初期値 1.5)で引き伸ばしを制限。自作の `forceEllipseRadial` で楕円に引き寄せ、ラベルは画面内・入力欄の上に収める。ウィンドウサイズ変更時に再計算
- 角度: 円周を表示数で等分したスロットに、順位をシャッフルして割り当て(中心アーティスト名をシードにした疑似乱数なので、同じ検索は常に同じ配置)。スロット内のゆらぎは `ANGLE_JITTER`(0〜0.8)、距離のゆらぎは `DISTANCE_JITTER`(0〜0.1)
- ノード識別子は `name`
- 線は中心 → 周辺のみ描画(周辺同士の関連線は描画しない。デザイン上シンプルにするため)
- API 呼び出しは検索ごとに `getSimilar` 1 回。検索中はローディング表示
- API キーは `.env` で管理し git 管理外。将来的にサーバーレス関数で隠す想定

## デプロイ

Vercel / Netlify などに静的サイトとしてデプロイ可能。環境変数 `VITE_LASTFM_API_KEY` を設定してください。
