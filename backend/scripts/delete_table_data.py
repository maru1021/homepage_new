import os
import psycopg2


DB_NAME = os.environ.get('DB_NAME', 'mydatabase')
DB_USER = os.environ.get('DB_USER', 'user')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'db')

def delete_all_data():
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
            AND tablename != 'alembic_version';
        """)
        tables = cur.fetchall()

        if not tables:
            print("削除するデータがありません。")
            return

        # テーブルのデータを削除
        for table in tables:
            table_name = table[0]
            cur.execute(f'TRUNCATE TABLE "{table_name}" CASCADE;')

        # シーケンスをリセット
        cur.execute("""
            DO $$
            DECLARE
                t_name text;
                seq_exists boolean;
            BEGIN
                FOR t_name IN
                    SELECT tablename FROM pg_tables
                    WHERE schemaname = 'public'
                    AND tablename != 'alembic_version'
                LOOP
                    -- シーケンスが存在するか確認
                    SELECT EXISTS (
                        SELECT 1 FROM pg_sequences
                        WHERE schemaname = 'public'
                        AND sequencename = t_name || '_id_seq'
                    ) INTO seq_exists;

                    -- シーケンスが存在する場合のみリセット
                    IF seq_exists THEN
                        EXECUTE format(
                            'ALTER SEQUENCE %I_id_seq RESTART WITH 1',
                            t_name
                        );
                    END IF;
                END LOOP;
            END $$;
        """)

        # 外部キー制約を再度有効化
        cur.execute("SET session_replication_role = 'origin';")

        print("\nすべてのテーブルのデータが正常に削除されました。")

    except Exception as e:
        print("エラーが発生しました:", str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    delete_all_data()
