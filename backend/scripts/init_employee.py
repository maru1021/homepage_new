from backend.authority.models import EmployeeAuthority, EmployeeCredential
from sqlalchemy.exc import SQLAlchemyError

from backend.scripts.hash_password import hashed_password

def init_employee(db, id, authorities=[]):
  try:
    print('--a')
    hash_password = hashed_password("password")
    employee_credential = EmployeeCredential(
        employee_id=id,
        hashed_password=hash_password
    )
    db.add(employee_credential)

    if(authorities):
      authorities = [
          EmployeeAuthority(
              employee_id=id,
              department_id=authority.department,
              admin=authority.admin
          )
          for authority in authorities
      ]

      db.bulk_save_objects(authorities)

    else:
      authority = EmployeeAuthority(
        employee_id=id,
        department_id=1,
        admin=False,
      )
      db.add(authority)

    return

  except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}