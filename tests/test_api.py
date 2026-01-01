import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "AIRIS" in response.json()["message"]

def test_get_interview_types():
    response = client.get("/interview-types")
    assert response.status_code == 200
    data = response.json()
    assert "types" in data
    assert "HR" in data["types"]
    assert "Technical" in data["types"]

def test_get_technologies():
    response = client.get("/technologies")
    assert response.status_code == 200
    data = response.json()
    assert "technologies" in data
    assert "Python" in data["technologies"]
    assert "FastAPI" in data["technologies"]
    assert "JavaScript" in data["technologies"]

def test_select_hr_type():
    response = client.post("/select-type", json={"type": "HR"})
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "HR"
    assert "question" in data
    assert "category" in data

def test_select_technical_type():
    response = client.post("/select-type", json={"type": "Technical"})
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "Technical"
    assert "technologies" in data
    assert "Python" in data["technologies"]

def test_select_invalid_type():
    response = client.post("/select-type", json={"type": "Invalid"})
    assert response.status_code == 400

def test_select_technology():
    response = client.post("/select-technology", json={"technology": "Python"})
    assert response.status_code == 200
    data = response.json()
    assert data["technology"] == "Python"
    assert "question" in data
    assert "category" in data

def test_select_invalid_technology():
    response = client.post("/select-technology", json={"technology": "Invalid"})
    assert response.status_code == 400

def test_evaluate_answer():
    response = client.post("/evaluate", json={
        "interview_type": "HR",
        "question": "Tell me about yourself",
        "answer": "I am a developer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "strengths" in data
    assert "weaknesses" in data
    assert "suggestions" in data
    assert isinstance(data["strengths"], list)
    assert isinstance(data["weaknesses"], list)
    assert isinstance(data["suggestions"], list)