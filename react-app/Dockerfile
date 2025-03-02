# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up

# ビルドステージ
FROM node:18

WORKDIR /app/react-app

# package.jsonをコピー
COPY react-app/package*.json ./

# 依存関係をインストール
RUN npm install --legacy-peer-deps
RUN npm install -g serve@14.2.1

# ソースコードをコピー
COPY react-app/ .

# 環境変数の設定
ENV NODE_ENV=production
ENV SKIP_PREFLIGHT_CHECK=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# ビルド
RUN npm run build

EXPOSE 3000

# 静的ファイルを配信
CMD ["serve", "-s", "build", "--listen", "3000", "--no-clipboard"]
