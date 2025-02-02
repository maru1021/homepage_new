# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up -d

# ベースイメージ
FROM node:22

# 作業ディレクトリの設定
WORKDIR /homepage/react-app

# 依存ファイルをコピーしてインストールを実行
COPY react-app/package*.json .

# 一時的なキャッシュディレクトリを使用し、インストール後にキャッシュを削除
RUN npm install --prefix . --cache /tmp/empty-cache && rm -rf /tmp/empty-cache

# アプリケーション全体をコピー
COPY react-app/ .

# ポートのエクスポート
EXPOSE 3000

# アプリケーション起動
CMD ["npm", "start"]
