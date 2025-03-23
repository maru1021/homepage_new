from sqlalchemy import event
from backend.models import Base

class BaseModel(Base):
    __abstract__ = True

    def after_commit(self, session):
        print(f"after_commit - operation: {self._operation}")

def register_commit_event(operation):
    def register(mapper, connection, target):
        target._operation = operation
        session = target._sa_instance_state.session
        event.listen(session, 'after_commit',
                    lambda session: target.after_commit(session),
                    once=True)
    return register

event.listen(BaseModel, 'after_insert', register_commit_event('insert'))
event.listen(BaseModel, 'after_update', register_commit_event('update'))
event.listen(BaseModel, 'after_delete', register_commit_event('delete'))