前準備  
Dockerのインストール  

プロジェクトを立ち上げたいフォルダで  
git clone https://github.com/maru1021/homepage_new  
を実行し、リポジトリをローカルにコピーしてください。

cd homepage_new  
docker compose up --build  
を実行し、必要なパッケージをインストール、コンテナの立ち上げを行います。  

2回目以降は  
docker compose up  
で起動します  

初回  
ユーザー名 admin12  
パスワード password  
で起動します。

以降従業員登録で登録した社員番号、パスワードでログインできるようになります。  
現在codespaceだとうまく動作しません。

APIの構成は  
http://localhost:8000/docs
で見ることができます。

データベースは  
http://localhost:8080/  
データベースの種類 PostgreQL  
ユーザー名 user  
パスワード password  
データベース mydatabase  
で操作することができます。

