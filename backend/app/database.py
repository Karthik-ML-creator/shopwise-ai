import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import settings

logger = logging.getLogger("database")
logging.basicConfig(level=logging.INFO)

db_url = settings.DATABASE_URL
connect_args = {}

# Active check: Try to connect to PostgreSQL if configured, fallback to SQLite if offline
if db_url and "postgresql" in db_url:
    try:
        # Create a temporary engine with 1-second timeout to test connection
        # connect_timeout is passed to psycopg2
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 1})
        with temp_engine.connect() as conn:
            pass
        temp_engine.dispose()
        logger.info("⚡ Successfully connected to PostgreSQL Database Server.")
    except Exception as e:
        logger.warning("⚠️ PostgreSQL server is offline. Falling back to local SQLite database.")
        db_url = "sqlite:///./recommender.db"
        connect_args = {"check_same_thread": False}
else:
    logger.info("💾 PostgreSQL not configured. Initializing local SQLite database.")
    db_url = "sqlite:///./recommender.db"
    connect_args = {"check_same_thread": False}

# Create Database Engine
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

# Set up local session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency injection for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
