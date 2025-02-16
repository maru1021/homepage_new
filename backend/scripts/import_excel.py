from io import BytesIO
import pandas as pd

from backend.column_name import COLUMN_NAME


def import_excel(db, file, model_name, model, required_columns, websocket_func, before_add_func=None,
                 after_add_func=None, delete_check_func=None, name_duplication_check=True):
    try:
      # ExcelファイルをDataFrameに変換
      contents = file.file.read()  # 非同期でファイルを読み込む
      excel_data = BytesIO(contents)
      df = pd.read_excel(excel_data, engine="openpyxl")

        # 必須カラムの確認
      if not required_columns.issubset(df.columns):
          raise ValueError("Excelのフォーマットが正しくありません。'操作', 'ID', '部署名'の列が必要です。")

      # 列名を英語に変換
      column_name = COLUMN_NAME.get(model_name)
      if not column_name:
          raise ValueError(f"モデル '{model_name}' のカラムマッピングが見つかりません。")

      df.rename(columns=column_name, inplace=True)

      # 辞書形式に変換
      data_list = df.to_dict(orient="records")
      print(data_list)

      for row in data_list:
        import math

        action = str(row["action"]).strip()
        if action == "nan":
          continue

        row["id"] = int(row["id"]) if isinstance(row["id"], (int, float)) and not math.isnan(row["id"]) else False

        if action in ("削除", "編集") and not isinstance(row["id"], int):
          raise ValueError(f"ID '{row['id']}' を整数に修正してください。")

        id = row["id"]

        if not id:
          del row["id"]

        if action == "追加":
          if id:
            duplication_check_data = db.query(model).filter(model.id == id).first()
            if duplication_check_data:
              raise ValueError(f"ID {id} は既に存在しています。")

          if name_duplication_check:
            duplication_check_data = db.query(model).filter(model.name == row["name"]).first()
            if duplication_check_data:
              raise ValueError(f"名称: {row['name']} はすでに登録されています。")

          del row["action"]

          if before_add_func:
            row = before_add_func(row)

          new_model = model(**row)
          db.add(new_model)
          db.flush()
          db.refresh(new_model)

          if after_add_func:
            after_add_func(new_model, db)
          continue

        if not id:
          raise ValueError(f"IDを記入していない行があります。")

        elif action == "編集":
          duplication_check_data = db.query(model).filter(model.id == id).first()
          if not duplication_check_data:
            raise ValueError(f"編集対象のID {id} が見つかりません。")

          if name_duplication_check:
            duplication_check_data = db.query(model).filter(model.name == row["name"], model.id != id).first()
            if duplication_check_data:
              raise ValueError(f"{row['name']} は既に存在しています。")

          del row["action"]
          db.query(model).filter(model.id == id).update(row, synchronize_session=False)
          continue

        elif action == "削除":
          delete_data = db.query(model).filter(model.id == id).first()
          if not delete_data:
              raise ValueError(f"削除対象のID {id} が見つかりません。")

          if delete_check_func:
            delete_check_func(db, delete_data, id)

          db.delete(db.merge(delete_data))
          continue

        else:
          raise ValueError(f"無効な操作 '{action}' が含まれています。'追加', '編集', '削除' のいずれかを指定してください。")

      db.commit()

      websocket_func()

      return {"success": True, "message": "Excelデータをインポートしました"}
    except Exception as e:
      db.rollback()
      print(str(e))
      return {"success": False, "message": str(e), "field": ""}