前準備
Docker のインストール

プロジェクトを立ち上げたいフォルダで
git clone https://github.com/maru1021/homepage_new
を実行し、リポジトリをローカルにコピーしてください。

cd homepage_new
docker compose -f docker-compose.dev.yml up --build
を実行し、必要なパッケージのインストール、コンテナの立ち上げを行なって下さい。

データベースの復元
docker compose -f docker-compose.dev.yml exec fastapi bash
python backend/scripts/backup/restore_database.py
を実行することでデータベースを復元できます。

2 回目以降は
docker compose -f docker-compose.dev.yml up
で起動します

ユーザー名 admin00
パスワード password
でログインできます。

以降従業員登録で登録した社員番号、
password
でログインできるようになります。
codespace だとうまく動作しません。

権限のないユーザーだと掲示板しか見れないので
総務部 → 従業員権限一覧で権限を付与して下さい。
利用者は閲覧、登録のみ
管理者は右クリックでの編集、削除含む全操作
が行えます。

API の構成は
http://localhost:8000/docs
で見ることができます。

データベースは
http://localhost:8080/
データベースの種類 PostgreQL
ユーザー名 user
パスワード password
データベース mydatabase
で操作することができます。
