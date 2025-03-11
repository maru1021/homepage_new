from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker


SQLALCHEMY_DATABASE_URL = "postgresql://user:password@db:5432/mydatabase"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# コミット後のafter_commitメソッドを実行する
def setup_commit_hooks():
    @event.listens_for(Session, "after_commit")
    def run_after_commit_hooks(session):
        for obj in list(session.identity_map.values()):
            if hasattr(obj, 'after_commit') and callable(obj.after_commit):
                obj.after_commit(session)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)

init_db()
setup_commit_hooks()