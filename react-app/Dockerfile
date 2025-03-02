# パッケージ追加時
# npm install パッケージ名
# docker compose down
# docker compose build --no-cache
# docker compose up

# ビルドステージ
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# 実行ステージ
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
