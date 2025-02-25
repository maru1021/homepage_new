import subprocess
import os
import shutil
from pathlib import Path
from backend.scripts.get_time import now

# データベース接続情報を環境変数から取得（デフォルト値付き）
DB_NAME = os.environ.get('DB_NAME', 'mydatabase')
DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')

def backup_database():
    script_dir = Path(__file__).parent.parent.parent
    backup_dir = script_dir / "backup"
    backup_old_dir = backup_dir / "old"
    os.makedirs(backup_dir, exist_ok=True)
    os.makedirs(backup_old_dir, exist_ok=True)
    backup_path = backup_dir / "dump.sql"

    # 古いバックアップファイルが存在する場合、oldディレクトリに移動
    if backup_path.exists():
        with open(backup_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            if first_line.startswith('-- Backup created at: '):
                old_time = first_line[21:]  # "-- Backup created at: " の長さは21
                old_filename = f"{old_time.replace(' ', '_').replace(':', '-').strip('_')}.sql"
                old_backup_path = backup_old_dir / old_filename
                shutil.move(str(backup_path), str(old_backup_path))
                print(f"古いバックアップを移動しました: {old_backup_path}")

    current_time = now().strftime("%Y-%m-%d %H:%M:%S")
    backup_header = f"-- Backup created at: {current_time}\n\n"

    command = f"PGPASSWORD={DB_PASSWORD} pg_dump -h {DB_HOST} -U {DB_USER} {DB_NAME}"

    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, check=True
        )

        if result.stderr:
            print("pg_dump 警告/エラー:", result.stderr)
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(backup_header)  # 日時コメントを先頭に追加
            f.write(result.stdout)
        print(f"バックアップが正常に作成されました: {backup_path}")
    except subprocess.CalledProcessError as e:
        print("バックアップに失敗しました。")
        print("エラー内容:", e.stderr)

if __name__ == "__main__":
    backup_database()
