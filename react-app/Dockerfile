# ビルド済みのファイルを使用する場合は、buildディレクトリを事前に配置してください

FROM nginx:alpine
COPY ./build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
