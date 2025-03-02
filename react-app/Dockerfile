# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up -d

# ビルドステージ
FROM node:18

WORKDIR /app/react-app

# package.jsonをコピー
COPY react-app/package*.json ./

# 依存関係をインストール
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object@7.21.11

# ソースコードをコピー
COPY react-app/ .

# 環境変数の設定（デフォルトは本番環境）
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV SKIP_PREFLIGHT_CHECK=true

# 環境に応じた.envファイルをコピー
COPY react-app/.env.${NODE_ENV} ./.env

EXPOSE 3000

# 環境に応じてコマンドを変更（メモリ制限を増やす）
CMD if [ "$NODE_ENV" = "production" ] ; then \
      NODE_OPTIONS="--max-old-space-size=4096" npm run build && \
      npm install -g serve && \
      serve -s build ; \
    else \
      npm start ; \
    fi
