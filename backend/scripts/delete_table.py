import os
import psycopg2


DB_NAME = os.environ.get('DB_NAME', 'mydatabase')
DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')

def delete_all_tables():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        conn.autocommit = True
        cur = conn.cursor()

        # 外部キー制約を一時的に無効化
        cur.execute("SET session_replication_role = 'replica';")

        # 既存のテーブルを取得
        cur.execute("""
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
        """)
        tables = cur.fetchall()

        if not tables:
            print("削除するテーブルがありません。")
            return

        # テーブルを削除
        for table in tables:
            table_name = table[0]
            cur.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')

        # シーケンスも削除
        cur.execute("""
            SELECT sequence_name FROM information_schema.sequences
            WHERE sequence_schema = 'public';
        """)
        sequences = cur.fetchall()

        for seq in sequences:
            seq_name = seq[0]
            print(f"シーケンス {seq_name} を削除中...")
            cur.execute(f'DROP SEQUENCE IF EXISTS "{seq_name}" CASCADE;')

        # 外部キー制約を再度有効化
        cur.execute("SET session_replication_role = 'origin';")

        print("\nすべてのテーブルとシーケンスが正常に削除されました。")

    except Exception as e:
        print("エラーが発生しました:", str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    delete_all_tables()
