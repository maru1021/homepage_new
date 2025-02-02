初回起動時、パッケージ追加時はルートディレクトリで
docker compose up --build
を実行し、必要なパッケージをインストールさせてください。

その後、
docker-compose exec fastapi alembic revision --autogenerate -m "コメント"
docker-compose exec fastapi alembic upgrade head
を実行しマイグレーションを行なってください。

2回目以降は
docker compose up
で起動します。