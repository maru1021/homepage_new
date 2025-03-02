# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up -d

# ビルドステージ
FROM node:18 AS builder

WORKDIR /app

# package.jsonをコピー
COPY react-app/package*.json ./

# 依存関係をインストール
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object@7.21.11

# ソースコードをコピー
COPY react-app/ .

# ビルド
ENV SKIP_PREFLIGHT_CHECK=true
ENV BABEL_ENV=production
ENV NODE_ENV=production
RUN npm run build

# 実行ステージ
FROM node:18-slim

WORKDIR /app

# serveをインストール
RUN npm install -g serve

# ビルドしたファイルをコピー
COPY --from=builder /app/build ./build

EXPOSE 3000

# アプリケーション起動
CMD ["serve", "-s", "build"]
