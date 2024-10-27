https://console.cloud.google.com/apis/credentials
でgoogle booksのAPIキー取得後
react-app/.envで
REACT_APP_GOOGLE_BOOKS_API_KEY=取得したAPIキーとして定義
後々サーバーサイドへの管理に変更

初回起動時、パッケージ追加時はルートディレクトリで
docker compose up --build
を実行し、必要なパッケージをインストールさせてください。

2回目以降は
docker compose up
で起動します。