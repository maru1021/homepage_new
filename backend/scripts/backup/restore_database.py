import os
from pathlib import Path
import time
import psycopg2
import re
from typing import List


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
                    table_name = re.search(r'COPY public\.(\w+)', current_copy_table).group(1)
                    columns = re.search(r'\((.*?)\)', current_copy_table).group(1)
                    for data_line in copy_data:
                        if data_line.strip():
                            values = data_line.split('\t')
                            formatted_values = []
                            for val in values:
                                val = val.strip()
                                if val == '\\N':
                                    formatted_values.append('NULL')
                                elif re.match(r'^\d+$', val):
                                    formatted_values.append(val)
                                elif re.match(r'^\d{4}-\d{2}-\d{2}', val):
                                    formatted_values.append(f"'{val}'")
                                elif val.lower() in ['t', 'f', 'true', 'false']:
                                    formatted_values.append('true' if val.lower() in ['t', 'true'] else 'false')
                                else:
                                    escaped_val = val.replace("'", "''")
                                    formatted_values.append(f"'{escaped_val}'")
                            insert_stmt = f"INSERT INTO public.{table_name} ({columns}) VALUES ({', '.join(formatted_values)});"
                            statements.append(insert_stmt)
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
    table_order = [
        'types',
        'classifications',
        'articles',
        'departments',
        'employees',
        'employee_credential',
        'employeeinfos',
        'employee_authority'
    ]

    if not wait_for_db():
        return

    script_dir = Path(__file__).parent.parent.parent
    dump_file = script_dir / "backup" / "dump.sql"

    if not dump_file.exists():
        print(f"バックアップファイルが存在しません: {dump_file}")
        return

    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        conn.autocommit = True
        cur = conn.cursor()

        with open(dump_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

            # 既存のテーブルをドロップ
            for table in table_order:
                cur.execute(f"DROP TABLE IF EXISTS public.{table} CASCADE;")

            # SQLステートメントをパースして実行
            statements = parse_sql_file(sql_content)

            for stmt in statements:
                if stmt.startswith('CREATE SEQUENCE'):
                    try:
                        sequence_name = re.search(r'CREATE SEQUENCE public\.(\w+)', stmt).group(1)
                        cur.execute(f"DROP SEQUENCE IF EXISTS public.{sequence_name} CASCADE;")
                        cur.execute(stmt)
                    except Exception as e:
                        print(f"Warning: シーケンス作成をスキップしました: {str(e)}")

            for stmt in statements:
                if stmt.startswith('CREATE TABLE'):
                    for table in table_order:
                        if f'CREATE TABLE public.{table}' in stmt:
                            cur.execute(stmt)
                            break

            for stmt in statements:
                if stmt.startswith('ALTER SEQUENCE') and 'OWNED BY' in stmt:
                    cur.execute(stmt)

            for stmt in statements:
                if ('ALTER TABLE' in stmt and 'PRIMARY KEY' in stmt) or stmt.startswith('CREATE INDEX'):
                    for table in table_order:
                        if f'public.{table}' in stmt:
                            print(f"{table}のインデックス/制約を追加します...")
                            cur.execute(stmt)
                            break

            for table in table_order:
                data_count = 0

                for stmt in statements:
                    if f"INSERT INTO public.{table} " in stmt:
                        try:
                            cur.execute(stmt)
                            data_count += 1
                        except Exception as e:
                            print(f"エラー発生: {table}のデータ挿入に失敗")
                            print(f"SQL: {stmt}")
                            print(f"エラー: {str(e)}")
                            raise e

                print(f"{table}テーブルに {data_count} 件のデータを挿入しました")

            for stmt in statements:
                if 'ALTER TABLE' in stmt and 'FOREIGN KEY' in stmt:
                    for table in table_order:
                        if f'public.{table}' in stmt:
                            try:
                                constraint_name = re.search(r'ADD CONSTRAINT (\w+) FOREIGN KEY', stmt).group(1)
                                cur.execute(f"ALTER TABLE public.{table} DROP CONSTRAINT IF EXISTS {constraint_name};")
                                cur.execute(stmt)
                            except Exception as e:
                                print(f"エラー発生: {table}の外部キー制約追加に失敗")
                                print(f"SQL: {stmt}")
                                print(f"エラー: {str(e)}")
                                raise e

        cur.close()
        conn.close()
        print("データベースの復元が正常に完了しました。")
    except Exception as e:
        print("データベースの復元に失敗しました。")
        print("エラー内容:", str(e))
        print("エラーの詳細:", type(e).__name__)

if __name__ == "__main__":
    restore_database()