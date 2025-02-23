import subprocess
import os

def backup_database():
    # バックアップディレクトリの作成（このスクリプトの位置を基準）
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(current_dir, "backup")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, "dump.sql")

    # dockerを使わず、直接pg_dumpを実行する
    # 接続先は 'db' サービス、ユーザーは 'user'、パスワードは 'password'
    command = "PGPASSWORD=password pg_dump -h db -U user mydatabase"

    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, check=True
        )
        # エラー出力があれば表示（警告等）
        if result.stderr:
            print("pg_dump 警告/エラー:", result.stderr)
        # バックアップファイルに書き込み
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(result.stdout)
        print(f"バックアップが正常に作成されました: {backup_path}")
    except subprocess.CalledProcessError as e:
        print("バックアップに失敗しました。")
        print("エラー内容:", e.stderr)

if __name__ == "__main__":
    backup_database()
