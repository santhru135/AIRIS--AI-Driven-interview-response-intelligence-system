# AIRIS - AI Interview Practice System

An AI-powered interview practice tool that simulates a real interviewer by asking questions, evaluating answers, and providing structured feedback.

## Features

- Complete web interface with HTML/CSS/JavaScript
- HR and Technical interview practice
- AI evaluation of user answers using NVIDIA Gemma model (free)
- Structured feedback with strengths, weaknesses, and improvement suggestions
- FastAPI REST API backend

## Quick Start

1. **Start the backend:**
   ```bash
   python api.py
   ```

2. **Open the frontend:**
   - Open `index.html` in your web browser
   - Or serve it with a local server: `python -m http.server 3000`

3. **Practice interviews:**
   - Choose HR or Technical interview
   - Answer the question
   - Get AI-powered feedback

## Setup

1. **Get NVIDIA API Key (Free)**:
   - Go to https://ngc.nvidia.com/
   - Create free account
   - Generate API key from your profile
   - Copy the key

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment:
   Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your NVIDIA API key:
   ```
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```

4. Run the API server:
   ```bash
   python api.py
   ```

## Complete AIRIS Setup

### Backend (Python/FastAPI)
```bash
python api.py
```
Server runs on: http://localhost:8000

### Frontend (HTML/CSS/JS)
```bash
python -m http.server 3000
```
Open in browser: http://localhost:3000

### Full Application Flow
1. Start backend: `python api.py`
2. Start frontend: `python -m http.server 3000`
3. Open http://localhost:3000 in browser
4. Practice interviews with AI feedback!

## Usage

### HR Interview
1. Click "HR Interview"
2. Answer the question in the textarea
3. Click "Submit Answer"
4. View AI-generated feedback

### Technical Interview
1. Click "Technical Interview"
2. Choose technology (Python or FastAPI)
3. Answer the question in the textarea
4. Click "Submit Answer"
5. View AI-generated feedback

## Architecture

- **Frontend**: `index.html` + `styles.css` + `script.js`
- **Backend**: `api.py` + `main.py` + `questions.py`
- **Communication**: HTTP JSON via fetch API
- **AI**: NVIDIA Gemma model (free)

## API Endpoints

- `GET /` - Welcome message
- `GET /interview-types` - Get available interview types (HR, Technical)
- `POST /select-type` - Select interview type
- `POST /select-technology` - Select technology for technical interviews (Python, FastAPI)
- `POST /evaluate` - Submit an answer for evaluation

## Interview Flow

### 1. Choose Interview Type
```bash
GET /interview-types
# Returns: {"types": ["HR", "Technical"]}
```

### 2. Select Type
```bash
POST /select-type
Content-Type: application/json
{
  "type": "HR"
}
# Returns: {"type": "HR", "question": "Tell me about yourself", "category": "HR"}

# OR for Technical:
POST /select-type
{
  "type": "Technical"
}
# Returns: {"type": "Technical", "message": "Please specify the technology you want to be interviewed on (e.g., Python, JavaScript, React, etc.)"}
```

### 3. Specify Technology (if Technical)
```bash
POST /specify-technology
{
  "technology": "JavaScript"
}
# Returns: {"technology": "JavaScript", "question": "AI-generated question about JavaScript", "category": "Technical - JavaScript"}
```

### 4. Submit Answer & Get Feedback
```bash
POST /evaluate
{
  "question": "AI-generated question",
  "answer": "Your answer here"
}
# Returns structured feedback
```

## MVP Scope

- Text-based only
- Single question evaluation per request
- No authentication or database
- Focus on core AI evaluation workflow

## Troubleshooting

- **"Failed to fetch" errors**: Make sure backend is running on port 8000
- **API key issues**: Ensure `.env` has valid NVIDIA API key
- **CORS errors**: Frontend and backend must run on different ports
- **Questions not loading**: Check backend logs for errors
- **Feedback not working**: Verify NVIDIA API key has credits

## Project Structure

```
AIRIS/
├── api.py              # FastAPI backend
├── main.py             # AI evaluation logic
├── questions.py        # Question bank
├── requirements.txt    # Python dependencies
├── index.html          # Frontend interface
├── styles.css          # UI styling
├── script.js           # Frontend logic
├── .env                # API keys (not in git)
└── README.md           # This file
```