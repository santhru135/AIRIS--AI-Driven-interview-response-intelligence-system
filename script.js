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
const submitBtn = document.getElementById('submit-btn');

// Input
const answerInput = document.getElementById('answer-input');

// Landing elements
const startBtn = document.getElementById('start-btn');
const landing = document.querySelector('.landing');
const appContainer = document.querySelector('.app-container');

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

function updateProgress(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, index) => {
        if (index + 1 <= step) {
            s.classList.remove('bg-gray-300', 'text-gray-600');
            s.classList.add('bg-green-500', 'text-white');
        } else {
            s.classList.remove('bg-green-500', 'text-white');
            s.classList.add('bg-gray-300', 'text-gray-600');
        }
    });
}

function showApp() {
    console.log('Starting app...');
    hideSection(landing);
    showSection(appContainer);
    showSection(typeSelection);
    updateProgress(1);
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
    updateProgress(1);
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
            updateProgress(2);
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
async function showTechnologySelection() {
    try {
        const response = await fetch(`${API_BASE}/technologies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const technologies = data.technologies;

        // Clear existing buttons
        const techButtons = document.getElementById('tech-buttons');
        techButtons.innerHTML = '';

        // Create buttons dynamically
        technologies.forEach(tech => {
            const button = document.createElement('button');
            button.className = 'bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-600 transition duration-300';
            button.textContent = tech;
            button.addEventListener('click', () => selectTechnology(tech));
            techButtons.appendChild(button);
        });

        hideSection(typeSelection);
        showSection(techSelection);
    } catch (error) {
        showError(`Failed to load technologies: ${error.message}`);
    }
}

function showQuestion(question, category) {
    currentQuestion = question;
    document.getElementById('question-title').textContent = `${category} Interview Question`;
    document.getElementById('question-display').textContent = question;

    hideSection(typeSelection);
    hideSection(techSelection);
    showSection(questionSection);
    updateProgress(3);
}

function showFeedback(feedback) {
    const feedbackContent = document.getElementById('feedback-content');
    feedbackContent.innerHTML = '';

    // Strengths
    if (feedback.strengths && feedback.strengths.length > 0) {
        const strengthsDiv = document.createElement('div');
        strengthsDiv.className = 'bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4';
        strengthsDiv.innerHTML = `
            <h4 class="text-lg font-semibold text-green-800 mb-2">✅ Strengths</h4>
            <ul class="list-disc list-inside text-gray-700">
                ${feedback.strengths.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(strengthsDiv);
    }

    // Weaknesses
    if (feedback.weaknesses && feedback.weaknesses.length > 0) {
        const weaknessesDiv = document.createElement('div');
        weaknessesDiv.className = 'bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4';
        weaknessesDiv.innerHTML = `
            <h4 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ Areas for Improvement</h4>
            <ul class="list-disc list-inside text-gray-700">
                ${feedback.weaknesses.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(weaknessesDiv);
    }

    // Suggestions
    if (feedback.suggestions && feedback.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4';
        suggestionsDiv.innerHTML = `
            <h4 class="text-lg font-semibold text-blue-800 mb-2">💡 Suggestions</h4>
            <ul class="list-disc list-inside text-gray-700">
                ${feedback.suggestions.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        feedbackContent.appendChild(suggestionsDiv);
    }

    hideSection(questionSection);
    showSection(feedbackSection);
    updateProgress(4);
}

// Event Listeners
startBtn.addEventListener('click', showApp);
const startBtnBottom = document.getElementById('start-btn-bottom');
if (startBtnBottom) {
    startBtnBottom.addEventListener('click', showApp);
}
hrBtn.addEventListener('click', () => selectInterviewType('HR'));
technicalBtn.addEventListener('click', () => selectInterviewType('Technical'));
submitBtn.addEventListener('click', submitAnswer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resetUI();
    showSection(typeSelection);
});