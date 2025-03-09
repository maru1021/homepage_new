from backend.authority.models import EmployeeAuthority, EmployeeCredential
from backend.general.models import EmployeeInfo
from sqlalchemy.exc import SQLAlchemyError
from backend.scripts.get_time import today

from backend.scripts.hash_password import hashed_password

def init_employee(db, id, authorities=[], info=None):
  try:
    current_date = today()

    hash_password = hashed_password("password")
    employee_credential = EmployeeCredential(
        employee_id=id,
        hashed_password=hash_password,
        password_updated_at=current_date
    )
    db.add(employee_credential)

    if(authorities):
      authorities = [
          EmployeeAuthority(
              employee_id=id,
              department_id=authority.department,
              admin=authority.admin,
              start_date=current_date
          )
          for authority in authorities
      ]
      db.bulk_save_objects(authorities)
    else:
      authority = EmployeeAuthority(
        employee_id=id,
        department_id=1,
        admin=False,
        start_date=current_date
      )
      db.add(authority)


    info = EmployeeInfo(
      employee_id=id,
      phone_number=info.phone_number if info else "000-0000-0000",
      gender=info.gender if info else "未設定",
      emergency_contact=info.emergency_contact if info else "000-0000-0000",
      address=info.address if info else "未設定",
      birth_date=info.birth_date if info else current_date,
      employment_type=info.employment_type if info else "正社員",
      hire_date=info.hire_date if info else current_date
    )
    db.add(info)

    return {"success": True, "message": "従業員の初期化が完了しました"}

  except SQLAlchemyError as e:
    db.rollback()
    print(f"エラーが発生しました: {e}")
    return {"success": False, "message": f"データベースエラーが発生しました: {str(e)}", "field": ""}