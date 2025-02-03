初回起動時、パッケージ追加時はルートディレクトリで
docker compose up --build
を実行し、必要なパッケージをインストールさせてください。

その後、
docker exec -it homepage_new-fastapi-1 alembic downgrade base
docker exec -it homepage_new-fastapi-1 alembic revision --autogenerate -m "マイグレーションファイル作成"
docker exec -it homepage_new-fastapi-1 alembic upgrade head
を実行しマイグレーションを行なってください。

2回目以降は
docker compose up
で起動します

パスワード
初回
ユーザー名 maru123
パスワード password
で起動します。

以降従業員登録で登録した社員番号、パスワードでログインできるようになります。