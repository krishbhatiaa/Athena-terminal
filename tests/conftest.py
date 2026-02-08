import pytest
from fastapi.testclient import TestClient
from server.main import app
from server.models import database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use in-memory database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables ONCE at startup
database.Base.metadata.drop_all(bind=engine)
database.Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override the default database dependency with test database."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Apply the override BEFORE creating the test client
app.dependency_overrides[database.get_db] = override_get_db

# Create test client with overridden dependencies
client = TestClient(app)


@pytest.fixture(scope="function", autouse=True)
def reset_db():
    """Reset database before each test."""
    database.Base.metadata.drop_all(bind=engine)
    database.Base.metadata.create_all(bind=engine)
    yield
    # Optionally clean up after test (for isolation)
    # database.Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Database session fixture."""
    session = TestingSessionLocal()
    yield session
    session.close()

