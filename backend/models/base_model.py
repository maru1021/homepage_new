from backend.models import Base

class BaseModel(Base):
    __abstract__ = True

    def after_commit(self, session):
        print("after_commit")