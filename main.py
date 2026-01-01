import os
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize NVIDIA Gemma LLM (free tier available)
# Check if API key is available
nvidia_api_key = os.getenv("NVIDIA_API_KEY")
logger.info(f"NVIDIA API Key found: {bool(nvidia_api_key)}")
if nvidia_api_key:
    try:
        llm = ChatNVIDIA(
            model="google/gemma-7b",
            temperature=0.7,
            api_key=nvidia_api_key
        )
        logger.info("LLM initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing LLM: {e}")
        logger.info("Using mock responses for testing.")
        llm = None
else:
    logger.warning("NVIDIA_API_KEY not found. Using mock responses for testing.")
    llm = None

# Prompt template for evaluating interview answers
evaluation_prompt = ChatPromptTemplate.from_template("""
You are an expert interviewer evaluating a candidate's response to an interview question.

Question: {question}

Candidate's Answer: {user_answer}

Provide constructive feedback on this interview answer. Include:
- What was good about the answer
- What could be improved
- Specific suggestions for better responses

Keep your feedback concise but helpful.
""")

# Create the chain only if LLM is available
if llm:
    evaluation_chain = LLMChain(llm=llm, prompt=evaluation_prompt)
else:
    evaluation_chain = None
    question_chain = None

def evaluate_answer(question: str, user_answer: str) -> dict:
    """
    Evaluate a user's answer to an interview question using AI.
    
    Returns a dictionary with strengths, weaknesses, and suggestions.
    """
    # Mock response for testing when API key is not available
    if not evaluation_chain:
        logger.info("Using mock evaluation response")
        return {
            "strengths": [
                "Clear and concise response",
                "Shows basic understanding of the topic",
                "Good structure and organization"
            ],
            "weaknesses": [
                "Could provide more specific examples",
                "Lacks technical depth in some areas"
            ],
            "suggestions": [
                "Add concrete examples from your experience",
                "Include technical details and best practices",
                "Consider the broader context and implications"
            ]
        }
    
    try:
        logger.info("Calling AI for evaluation")
        response = evaluation_chain.run(question=question, user_answer=user_answer)
        logger.info("AI evaluation response received")
        # Parse the response into structured feedback
        feedback_text = response.strip()
        
        # Initialize lists
        strengths = []
        weaknesses = []
        suggestions = []
        
        # Split the response into sections based on the actual format
        lines = feedback_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for section headers (updated to match AI output format)
            if '**Strengths:**' in line or 'strengths:' in line.lower():
                current_section = 'strengths'
                continue
            elif '**Weaknesses:**' in line or 'weaknesses:' in line.lower():
                current_section = 'weaknesses' 
                continue
            elif '**Suggestions' in line or 'suggestions' in line.lower():
                current_section = 'suggestions'
                continue
                
            # If we're in a section and this is a bullet point, add it
            if current_section and (line.startswith('*') or line.startswith('-')):
                clean_line = line[1:].strip() if line.startswith('*') or line.startswith('-') else line.strip()
                if current_section == 'strengths':
                    strengths.append(clean_line)
                elif current_section == 'weaknesses':
                    weaknesses.append(clean_line)
                elif current_section == 'suggestions':
                    suggestions.append(clean_line)
        
        # Fallback if parsing failed
        if not strengths and not weaknesses and not suggestions:
            logger.warning("Failed to parse AI response, using fallback")
            return {
                "strengths": ["AI evaluation completed"],
                "weaknesses": ["See suggestions for details"],
                "suggestions": [feedback_text]
            }
        
        # Ensure we have at least one item in each
        return {
            "strengths": strengths if strengths else ["Answer shows basic understanding"],
            "weaknesses": weaknesses if weaknesses else ["Could provide more technical details"],
            "suggestions": suggestions if suggestions else ["Consider adding specific examples and technical depth"]
        }
    except Exception as e:
        logger.error(f"AI evaluation failed: {str(e)}, falling back to mock")
        return {
            "strengths": ["Unable to evaluate due to error"],
            "weaknesses": [f"Error: {str(e)}"],
            "suggestions": ["Please try again"]
        }

# Prompt template for generating technical questions
question_prompt = ChatPromptTemplate.from_template("""
You are an expert interviewer creating technical interview questions.

Create one good technical interview question about {technology}.

The question should be:
- Relevant to {technology}
- Appropriate for a mid-level developer
- Test practical knowledge and understanding
- Be clear and concise

Return only the question text, nothing else.
""")

# Create the question generation chain
if llm:
    question_chain = LLMChain(llm=llm, prompt=question_prompt)
else:
    question_chain = None

def generate_question(technology: str) -> str:
    """
    Generate a technical interview question about the specified technology.
    
    Returns a single question string.
    """
    # Mock questions for testing when API key is not available
    if not question_chain:
        mock_questions = {
            "Python": "Explain the difference between lists and tuples in Python, and when would you use each?",
            "FastAPI": "How do you handle authentication and authorization in a FastAPI application?",
            "JavaScript": "What is the difference between var, let, and const in JavaScript?",
            "React": "Explain the component lifecycle methods in React and their use cases.",
            "SQL": "What are the different types of JOINs in SQL and when would you use each?",
            "Docker": "How do you optimize a Docker image for production deployment?"
        }
        return mock_questions.get(technology, f"What are the key concepts and best practices in {technology}?")
    
    try:
        response = question_chain.run(technology=technology)
        return response.strip()
    except Exception as e:
        return f"What are the key concepts and best practices in {technology}?"
