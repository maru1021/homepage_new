import os
from pathlib import Path
import time
import psycopg2
import re

def wait_for_db():
    max_retries = 30
    retry_interval = 1

    for _ in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname="mydatabase",
                user="user",
                password="password",
                host="db"
            )
            conn.close()
            return True
        except psycopg2.OperationalError:
            time.sleep(retry_interval)
    return False

def restore_database():    
    # データベースの準備ができるまで待機
    if not wait_for_db():
        print("データベースに接続できません")
        return

    # バックアップファイルのパスを設定
    script_dir = Path(__file__).parent.parent.parent
    dump_file = script_dir / "backup" / "dump.sql"

    print("バックアップファイルのパス:", dump_file)

    # バックアップファイルが存在するか確認
    if not os.path.exists(dump_file):
        print(f"バックアップファイルが存在しません: {dump_file}")
        return

    try:
        print("PostgreSQLに接続を試みます...")
        conn = psycopg2.connect(
            dbname="mydatabase",
            user="user",
            password="password",
            host="db"
        )
        conn.autocommit = True
        cur = conn.cursor()

        with open(dump_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

            # 既存のテーブルをドロップ
            print("既存のテーブルをクリアします...")
            for table in ['articles', 'classifications', 'types', 'departments', 'employees', 'employee_credential', 'employeeinfos', 'employee_authority']:
                cur.execute(f"DROP TABLE IF EXISTS public.{table} CASCADE;")

            # SQLステートメントを分割して実行
            statements = []
            current_statement = []
            in_copy = False
            current_copy_table = None
            copy_data = []

            for line in sql_content.split('\n'):
                line = line.strip()

                # COPYコマンドの開始を検出
                if line.startswith('COPY '):
                    in_copy = True
                    current_copy_table = line
                    continue


                if in_copy and line == '\\.':
                    in_copy = False
                    if copy_data:
                        table_name = re.search(r'COPY public\.(\w+)', current_copy_table).group(1)
                        columns = re.search(r'\((.*?)\)', current_copy_table).group(1)
                        for data_line in copy_data:
                            if data_line.strip():
                                values = data_line.split('\t')

                                # 値を適切にフォーマット
                                formatted_values = []
                                for val in values:
                                    val = val.strip()
                                    if val == '\\N':
                                        formatted_values.append('NULL')
                                    elif re.match(r'^\d+$', val):
                                        # 数値はそのまま
                                        formatted_values.append(val)
                                    elif re.match(r'^\d{4}-\d{2}-\d{2}', val):
                                        # 日付/時刻値
                                        formatted_values.append(f"'{val}'")
                                    elif val == 'f' or val == 't':
                                        # boolean値
                                        formatted_values.append(val)
                                    else:
                                        # その他の値はエスケープして引用符で囲む
                                        escaped_val = val.replace("'", "''")
                                        formatted_values.append(f"'{escaped_val}'")

                                insert_stmt = f"INSERT INTO public.{table_name} ({columns}) VALUES ({', '.join(formatted_values)});"
                                statements.append(insert_stmt)

                    copy_data = []
                    current_copy_table = None
                    continue

                # COPYデータの処理
                if in_copy:
                    if line:
                        copy_data.append(line)
                    continue

                # 通常のSQLステートメントの処理
                if not line or line.startswith('--'):
                    continue

                current_statement.append(line)
                if line.endswith(';'):
                    statements.append(' '.join(current_statement))
                    current_statement = []

            # すべてのモデルのテーブルを指定（依存関係順）
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

            # 各ステートメントを実行（テーブル作成）
            for stmt in statements:
                if stmt.startswith('CREATE TABLE'):
                    for table in table_order:
                        if f'CREATE TABLE public.{table}' in stmt:
                            cur.execute(stmt)
                            break

            # 主キー制約とインデックスを追加
            for stmt in statements:
                if ('ALTER TABLE' in stmt and 'PRIMARY KEY' in stmt) or stmt.startswith('CREATE INDEX'):
                    for table in table_order:
                        if f'public.{table}' in stmt:
                            print(f"{table}のインデックス/制約を追加します...")
                            print("実行するSQL:", stmt)
                            cur.execute(stmt)
                            break

            # データをテーブル順に挿入
            for table in table_order:
                data_count = 0
                print(f"\n{table}テーブルのデータを復元します...")

                # シーケンス値の取得と設定
                sequence_stmt = f"SELECT pg_catalog.setval('public.{table}_id_seq', (SELECT COALESCE(MAX(id), 0) FROM public.{table}), true);"

                for stmt in statements:
                    if stmt.startswith(f'INSERT INTO public.{table}'):
                        print(f"{table}にデータを挿入します...")
                        try:
                            cur.execute(stmt)
                            data_count += 1
                        except Exception as e:
                            print(f"エラー発生: {table}のデータ挿入に失敗")
                            print(f"SQL: {stmt}")
                            print(f"エラー: {str(e)}")
                            raise e

                # シーケンス値を更新
                try:
                    cur.execute(sequence_stmt)
                except Exception as e:
                    print(f"Warning: {table}のシーケンス更新をスキップしました")

                print(f"{table}テーブルに {data_count} 件のデータを挿入しました")

            fk_count = 0
            for stmt in statements:
                if 'ALTER TABLE' in stmt and 'FOREIGN KEY' in stmt:
                    for table in table_order:
                        if f'public.{table}' in stmt:
                            try:
                                cur.execute(stmt)
                                fk_count += 1
                            except Exception as e:
                                print(f"エラー発生: {table}の外部キー制約追加に失敗")
                                print(f"SQL: {stmt}")
                                print(f"エラー: {str(e)}")
                                raise e
            print(f"合計 {fk_count} 件の外部キー制約を追加しました")

        cur.close()
        conn.close()
        print("データベースの復元が正常に完了しました。")
    except Exception as e:
        print("データベースの復元に失敗しました。")
        print("エラー内容:", str(e))
        print("エラーの詳細:", type(e).__name__)

if __name__ == "__main__":
    restore_database()