from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from main import evaluate_answer, generate_question
from questions import get_interview_types, get_hr_question, get_technical_question, get_technologies
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIRIS - AI Interview Practice System", description="AI-powered interview practice tool")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class TypeSelection(BaseModel):
    type: str  # "HR" or "Technical"

class TechnologySelection(BaseModel):
    technology: str  # "Python" or "FastAPI"

class EvaluationRequest(BaseModel):
    interview_type: str  # "HR" or "Technical"
    technology: Optional[str] = None  # "Python", "FastAPI", or None
    question: str
    answer: str

class FeedbackResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]

@app.get("/")
async def root():
    return {"message": "Welcome to AIRIS - AI Interview Practice System"}

@app.get("/interview-types")
async def get_interview_types_endpoint():
    """Get available interview types"""
    return {"types": get_interview_types()}

@app.get("/technologies")
async def get_technologies_endpoint():
    """Get available technologies for technical interviews"""
    return {"technologies": get_technologies()}

@app.post("/select-type")
async def select_interview_type(request: TypeSelection):
    """Select interview type and get next step"""
    logger.info(f"Interview type selected: {request.type}")
    if request.type == "HR":
        question = get_hr_question()
        return {
            "type": "HR",
            "question": question["question"],
            "category": question["category"]
        }
    elif request.type == "Technical":
        return {
            "type": "Technical",
            "technologies": ["Python", "FastAPI"]
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid interview type")

@app.post("/select-technology")
async def select_technology(request: TechnologySelection):
    """Select technology and get technical question"""
    logger.info(f"Technology selected: {request.technology}")
    question = get_technical_question(request.technology)
    if question:
        return {
            "technology": request.technology,
            "question": question["question"],
            "category": question["category"]
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid technology")

@app.post("/evaluate", response_model=FeedbackResponse)
async def evaluate_user_answer(request: EvaluationRequest):
    """Evaluate user's answer and provide feedback"""
    logger.info(f"Evaluating answer for question: {request.question[:50]}...")
    try:
        feedback = evaluate_answer(request.question, request.answer)
        logger.info("Evaluation completed successfully")
        return FeedbackResponse(**feedback)
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")