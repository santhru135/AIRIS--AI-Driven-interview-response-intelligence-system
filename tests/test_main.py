import pytest
from main import evaluate_answer, generate_question

def test_evaluate_answer_mock():
    # Test with mock response (when no API key)
    result = evaluate_answer("Test question", "Test answer")
    assert "strengths" in result
    assert "weaknesses" in result
    assert "suggestions" in result
    assert isinstance(result["strengths"], list)
    assert isinstance(result["weaknesses"], list)
    assert isinstance(result["suggestions"], list)
    assert len(result["strengths"]) > 0
    assert len(result["weaknesses"]) > 0
    assert len(result["suggestions"]) > 0

def test_generate_question_mock():
    # Test with mock response
    question = generate_question("Python")
    assert isinstance(question, str)
    assert len(question) > 0
    assert "Python" in question or "python" in question.lower()

def test_generate_question_unknown_tech():
    question = generate_question("UnknownTech")
    assert isinstance(question, str)
    assert "UnknownTech" in question