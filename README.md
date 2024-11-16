初回起動時、パッケージ追加時はルートディレクトリで
docker compose up --build
を実行し、必要なパッケージをインストールさせてください。

2回目以降は
docker compose up
で起動します。