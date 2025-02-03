前準備  
Dockerのインストール  

プロジェクトを立ち上げたいフォルダで  
git clone https://github.com/maru1021/homepage_new  
を実行し、リポジトリのをローカルにコピーしてください。

cd homepage_new  
docker compose up --build  
を実行し、必要なパッケージをインストール、コンテナの立ち上げを行います。  

2回目以降は  
docker compose up  
で起動します  

パスワード  
初回  
ユーザー名 maru123  
パスワード password  
で起動します。

以降従業員登録で登録した社員番号、パスワードでログインできるようになります。  
現在codespaceだとうまく動作しません。