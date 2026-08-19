import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "JobTrack API" in response.json()["message"]

def test_user_registration_and_login():
    # 1. Register user
    reg_payload = {
        "name": "Test Candidate",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "test@example.com"
    assert "password_hash" not in data

    # 2. Login
    login_payload = {
        "username": "test@example.com",
        "password": "securepassword123"
    }
    res = client.post("/api/auth/login", data=login_payload)
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Get me
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Test Candidate"

def test_application_crud():
    # Register & Login
    client.post("/api/auth/register", json={"name": "Alice", "email": "alice@example.com", "password": "password123"})
    login_res = client.post("/api/auth/login", data={"username": "alice@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Application
    app_payload = {
        "company": "Stripe",
        "job_title": "Full Stack Engineer",
        "location": "Remote",
        "work_mode": "REMOTE",
        "salary_min": 3000000,
        "salary_max": 5000000,
        "status": "APPLIED",
        "priority": "HIGH",
        "source": "LinkedIn",
        "application_date": "2026-08-15"
    }
    res = client.post("/api/applications", json=app_payload, headers=headers)
    assert res.status_code == 201
    app_id = res.json()["id"]

    # 2. Get Application
    res = client.get(f"/api/applications/{app_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["company"] == "Stripe"

    # 3. Update Application Status
    res = client.patch(f"/api/applications/{app_id}", json={"status": "INTERVIEW"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "INTERVIEW"

    # 4. List Applications
    res = client.get("/api/applications", headers=headers)
    assert res.status_code == 200
    assert res.json()["total"] == 1

    # 5. Delete Application
    res = client.delete(f"/api/applications/{app_id}", headers=headers)
    assert res.status_code == 204
