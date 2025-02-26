# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up -d

# ベースイメージ
FROM node:18

# 作業ディレクトリの設定
WORKDIR /homepage/react-app

# package.jsonとpackage-lock.jsonをコピー
COPY react-app/package*.json ./

# 依存関係をインストール
RUN npm install

# 新しいパッケージを追加でインストール
RUN npm install react-dnd react-dnd-html5-backend immutability-helper

# アプリケーションのソースコードをコピー
COPY react-app/ .

# ポートのエクスポート
EXPOSE 3000

# アプリケーション起動
CMD ["npm", "start"]
