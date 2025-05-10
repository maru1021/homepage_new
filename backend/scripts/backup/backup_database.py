# docker exec -it homepage-fastapi-1 /bin/bash
# python backend/scripts/backup/backup_database.py

import subprocess
import os
import shutil
from pathlib import Path
from zoneinfo import ZoneInfo
from datetime import datetime

# データベース接続情報を環境変数から取得（デフォルト値付き）
DB_NAME = os.environ.get('DB_NAME', 'mydatabase')
DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')

JST = ZoneInfo("Asia/Tokyo")

def now():
    return datetime.now(JST)

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

    # pg_dumpコマンドのオプションを単純化
    command = [
        "pg_dump",
        "-h", DB_HOST,
        "-U", DB_USER,
        "--clean",          # 既存のテーブルを削除するコマンドを含める
        "--if-exists",      # DROP時にIF EXISTSを使用
        "--no-owner",       # オブジェクトの所有者の設定を除外
        "--no-privileges", # アクセス権限の設定を除外
        "--quote-all-identifiers", # すべての識別子をクォートする
        "--format=p",       # プレーンテキスト形式を使用
        DB_NAME
    ]

    try:
        # 環境変数としてパスワードを設定
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD

        result = subprocess.run(
            command,
            env=env,
            capture_output=True,
            text=True,
            check=True
        )

        if result.stderr:
            print("pg_dump 警告/エラー:", result.stderr)

        # バックアップファイルに書き込み
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(backup_header)  # 日時コメントを先頭に追加
            f.write(result.stdout)
        print(f"バックアップが正常に作成されました: {backup_path}")
    except subprocess.CalledProcessError as e:
        print("バックアップに失敗しました。")
        print("エラー内容:", e.stderr)

if __name__ == "__main__":
    backup_database()
