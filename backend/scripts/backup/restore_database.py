import os
from pathlib import Path
import time
import psycopg2
import re
from typing import List
import uuid
import subprocess


DB_NAME = os.environ.get('DB_NAME', 'mydatabase')
DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')

def wait_for_db():
    max_retries = 30
    retry_interval = 1

    for _ in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST
            )
            conn.close()
            return True
        except psycopg2.OperationalError:
            time.sleep(retry_interval)
    return False

def parse_sql_file(sql_content: str) -> List[str]:
    statements = []
    current_statement = []
    in_copy = False
    current_copy_table = None
    copy_data = []

    def escape_value(val: str) -> str:
        if val == '\\N':
            return 'NULL'
        if re.match(r'^\d+$', val):
            return val
        if re.match(r'^\d{4}-\d{2}-\d{2}', val):
            return f"'{val}'"
        if val.lower() in ['t', 'f', 'true', 'false']:
            return 'true' if val.lower() in ['t', 'true'] else 'false'

        # 特殊文字のエスケープ処理
        escaped_val = val

        # Djangoテンプレートタグを一時的なプレースホルダーに置換
        template_tags = []

        def replace_template_tag(match):
            tag = match.group(0)
            placeholder = f"__TEMPLATE_TAG_{len(template_tags)}__"
            template_tags.append(tag)
            return placeholder

        # {% ... %} と {{ ... }} を一時的に置換
        escaped_val = re.sub(r'{%.*?%}|{{.*?}}', replace_template_tag, escaped_val)

        # HTMLの属性値内のクォートを処理
        def replace_quotes(match):
            attr = match.group(1)
            value = match.group(2)
            return f'{attr}="{value}"'

        escaped_val = re.sub(r'(\s+\w+\s*=\s*)"([^"]*)"', replace_quotes, escaped_val)

        # 基本的なエスケープ処理
        escaped_val = escaped_val.replace("'", "''")

        # プレースホルダーを元のテンプレートタグに戻す
        for i, tag in enumerate(template_tags):
            placeholder = f"__TEMPLATE_TAG_{i}__"
            # テンプレートタグ内のシングルクォートをダブルクォートに変換
            tag = tag.replace("'", "''")
            escaped_val = escaped_val.replace(placeholder, tag)

        # 一意なタグを生成（衝突を避けるため、UUIDを使用）
        tag = f"QUOTE_{uuid.uuid4().hex}_TAG"

        # PostgreSQLのドル記号クォートを使用
        return f"${tag}${escaped_val}${tag}$"

    for line in sql_content.split('\n'):
        line = line.strip()

        if not line or line.startswith('--'):
            continue

        if line.startswith('COPY '):
            in_copy = True
            current_copy_table = line
            continue

        if in_copy:
            if line == '\\.':
                in_copy = False
                if copy_data:
                    try:
                        table_name = re.search(r'COPY public\.(\w+)', current_copy_table).group(1)
                        columns = re.search(r'\((.*?)\)', current_copy_table).group(1)
                        for data_line in copy_data:
                            if data_line.strip():
                                values = data_line.split('\t')
                                formatted_values = [escape_value(val.strip()) for val in values]
                                insert_stmt = f"INSERT INTO public.{table_name} ({columns}) VALUES ({', '.join(formatted_values)});"
                                statements.append(insert_stmt)
                    except Exception as e:
                        print(f"Warning: データの変換中にエラーが発生しました: {str(e)}")
                        print(f"問題のデータ: {data_line}")
                        continue
                copy_data = []
                current_copy_table = None
                continue
            if line:
                copy_data.append(line)
            continue

        current_statement.append(line)
        if line.endswith(';'):
            statements.append(' '.join(current_statement))
            current_statement = []

    return statements

def restore_database():
    if not wait_for_db():
        return

    script_dir = Path(__file__).parent.parent.parent
    dump_file = script_dir / "backup" / "dump.sql"

    if not dump_file.exists():
        print(f"バックアップファイルが存在しません: {dump_file}")
        return

    try:
        # psqlコマンドを使用してSQLファイルを直接実行
        command = [
            "psql",
            "-h", DB_HOST,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", str(dump_file)
        ]

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
            print("復元中の警告:", result.stderr)

        print("データベースの復元が正常に完了しました。")

    except subprocess.CalledProcessError as e:
        print("データベースの復元に失敗しました。")
        print("エラー内容:", e.stderr)
        print("エラーの詳細:", type(e).__name__)

if __name__ == "__main__":
    restore_database()