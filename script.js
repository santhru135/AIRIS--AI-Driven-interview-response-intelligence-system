// AIRIS - AI Interview Practice System Frontend Logic

const API_BASE = 'http://localhost:8001';

// DOM Elements
const typeSelection = document.getElementById('type-selection');
const techSelection = document.getElementById('tech-selection');
const questionSection = document.getElementById('question-section');
const feedbackSection = document.getElementById('feedback-section');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// Buttons
const hrBtn = document.getElementById('hr-btn');
const technicalBtn = document.getElementById('technical-btn');
const pythonBtn = document.getElementById('python-btn');
const fastapiBtn = document.getElementById('fastapi-btn');
const submitBtn = document.getElementById('submit-btn');

// Input
const answerInput = document.getElementById('answer-input');

// State
let currentInterviewType = null;
let currentTechnology = null;
let currentQuestion = null;

// Utility Functions
function showSection(section) {
    section.classList.remove('hidden');
}

function hideSection(section) {
    section.classList.add('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function resetUI() {
    hideSection(techSelection);
    hideSection(questionSection);
    hideSection(feedbackSection);
    hideLoading();
    answerInput.value = '';
    currentInterviewType = null;
    currentTechnology = null;
    currentQuestion = null;
}

// API Functions
async function selectInterviewType(type) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/select-type`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: type })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();

        currentInterviewType = type;

        if (type === 'HR') {
            // Show question directly
            showQuestion(data.question, data.category);
        } else if (type === 'Technical') {
            // Show technology selection
            showTechnologySelection();
        }
    } catch (error) {
        hideLoading();
        showError(`Failed to select interview type: ${error.message}`);
    }
}

async function selectTechnology(technology) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/select-technology`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ technology: technology })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();

        currentTechnology = technology;
        showQuestion(data.question, data.category);
    } catch (error) {
        hideLoading();
        showError(`Failed to select technology: ${error.message}`);
    }
}

async function submitAnswer() {
    const answer = answerInput.value.trim();
    if (!answer) {
        showError('Please provide an answer before submitting.');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                interview_type: currentInterviewType,
                technology: currentTechnology,
                question: currentQuestion,
                answer: answer
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();

        showFeedback(data);
    } catch (error) {
        hideLoading();
        showError(`Failed to evaluate answer: ${error.message}`);
    }
}

// UI Update Functions
function showTechnologySelection() {
    hideSection(typeSelection);
    showSection(techSelection);
}

function showQuestion(question, category) {
    currentQuestion = question;
    document.getElementById('question-title').textContent = `${category} Interview Question`;
    document.getElementById('question-display').textContent = question;

    hideSection(typeSelection);
    hideSection(techSelection);
    showSection(questionSection);
}

function showFeedback(feedback) {
    const feedbackContent = document.getElementById('feedback-content');
    feedbackContent.innerHTML = '';

    // Strengths
    if (feedback.strengths && feedback.strengths.length > 0) {
        const strengthsDiv = document.createElement('div');
        strengthsDiv.className = 'feedback-item strengths';
        strengthsDiv.innerHTML = `
            <h4>✅ Strengths</h4>
            <ul>
                ${feedback.strengths.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(strengthsDiv);
    }

    // Weaknesses
    if (feedback.weaknesses && feedback.weaknesses.length > 0) {
        const weaknessesDiv = document.createElement('div');
        weaknessesDiv.className = 'feedback-item weaknesses';
        weaknessesDiv.innerHTML = `
            <h4>⚠️ Areas for Improvement</h4>
            <ul>
                ${feedback.weaknesses.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(weaknessesDiv);
    }

    // Suggestions
    if (feedback.suggestions && feedback.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'feedback-item suggestions';
        suggestionsDiv.innerHTML = `
            <h4>💡 Suggestions</h4>
            <ul>
                ${feedback.suggestions.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(suggestionsDiv);
    }

    hideSection(questionSection);
    showSection(feedbackSection);
}

// Event Listeners
hrBtn.addEventListener('click', () => selectInterviewType('HR'));
technicalBtn.addEventListener('click', () => selectInterviewType('Technical'));
pythonBtn.addEventListener('click', () => selectTechnology('Python'));
fastapiBtn.addEventListener('click', () => selectTechnology('FastAPI'));
submitBtn.addEventListener('click', submitAnswer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resetUI();
    showSection(typeSelection);
});