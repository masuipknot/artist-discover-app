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

- 表示する関連アーティスト数: 6
- ノード識別子は `name`
- 線は中心 → 周辺のみ描画(周辺同士の関連線は描画しない。デザイン上シンプルにするため)
- API 呼び出しは検索ごとに `getSimilar` 1 回。検索中はローディング表示
- API キーは `.env` で管理し git 管理外。将来的にサーバーレス関数で隠す想定

## デプロイ

Vercel / Netlify などに静的サイトとしてデプロイ可能。環境変数 `VITE_LASTFM_API_KEY` を設定してください。
