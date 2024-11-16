from sqlalchemy.orm import Session

from . import schemas
from .. import models

def existing_department(db: Session, name: str):
    return db.query(models.Department).filter(models.Department.name == name).first()

def get_departments(db: Session, search: str = "", page: int = 1, limit: int = 10):
    query = db.query(models.Department)

    if search:
        query = query.filter(
            (models.Employee.name.contains(search))
        )

    total_count = query.count()  # 検索結果の総件数
    departments = query.offset((page - 1) * limit).limit(limit).all()  # ページネーション処理

    departments_data = [schemas.Department.from_orm(department) for department in departments]

    return departments_data, total_count

def create_department(db: Session, department: schemas.DepartmentCreate):
    if existing_department(db, department.name):
        return {"success": False, "message": "その部署はすでに登録されています", "field": "name"}

    db_department = models.Department(
        name=department.name,
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return {"message": "部署の登録に成功しました"}

