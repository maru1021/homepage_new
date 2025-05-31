from sqlalchemy.orm import joinedload, Session

from backend.api.general.models import Employee


def existing_employee(db: Session, employee_no: str, exclude_employee_id: int = False):
    query = db.query(Employee).filter(Employee.employee_no == employee_no)

    # 編集時には自身を除外
    if exclude_employee_id:
        query = query.filter(Employee.id != exclude_employee_id)

    return query.first()