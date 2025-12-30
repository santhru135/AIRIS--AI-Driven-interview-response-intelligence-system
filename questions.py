# Interview questions organized by type and technology

interview_questions = {
    "HR": [
        {
            "question": "Tell me about yourself",
            "category": "HR"
        },
        {
            "question": "Why do you want to work for our company?",
            "category": "HR"
        },
        {
            "question": "What are your strengths and weaknesses?",
            "category": "HR"
        }
    ],
    "Technical": {
        "Python": [
            {
                "question": "What is the difference between a list and a tuple in Python?",
                "category": "Python"
            },
            {
                "question": "Explain Python decorators",
                "category": "Python"
            },
            {
                "question": "What are lambda functions in Python?",
                "category": "Python"
            }
        ],
        "FastAPI": [
            {
                "question": "What is FastAPI and why is it used?",
                "category": "FastAPI"
            },
            {
                "question": "How do you handle request validation in FastAPI?",
                "category": "FastAPI"
            },
            {
                "question": "Explain dependency injection in FastAPI",
                "category": "FastAPI"
            }
        ]
    }
}

def get_interview_types():
    """Return available interview types"""
    return list(interview_questions.keys())

def get_technologies():
    """Return available technologies for technical interviews"""
    return list(interview_questions["Technical"].keys())

def get_hr_question():
    """Get a random HR question"""
    import random
    return random.choice(interview_questions["HR"])

def get_technical_question(technology):
    """Get a random technical question for the specified technology"""
    import random
    if technology in interview_questions["Technical"]:
        return random.choice(interview_questions["Technical"][technology])
    return None