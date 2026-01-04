// AIRIS - AI Interview Practice System Frontend Logic

const API_BASE = 'http://127.0.0.1:8001';

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
const micBtn = document.getElementById('mic-btn');
const clearBtn = document.getElementById('clear-btn');

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
let isRecording = false;
let recognition = null;
let recordingStartTime = null;
let recordingTimer = null;

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

// Voice Recognition Functions
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser');
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        answerInput.value = transcript;
        updateWordCount();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            showError('Microphone access was denied. Please allow microphone access to use voice input.');
        } else {
            showError('Error with speech recognition. Please try again.');
        }
        stopRecording();
    };

    recognition.onend = () => {
        if (isRecording) {
            try {
                recognition.start();
            } catch (e) {
                console.error('Error restarting recognition:', e);
                stopRecording();
            }
        }
    };

    return recognition;
}

function toggleRecording() {
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) {
            showError('Speech recognition is not supported in your browser');
            return;
        }
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    try {
        errorMessage.classList.add('hidden');
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(() => {
                recognition.start();
                isRecording = true;
                
                // Update UI
                micBtn.classList.add('bg-red-100', 'text-red-600');
                document.getElementById('mic-icon').classList.add('animate-pulse');
                document.querySelector('.recording-indicator').classList.remove('hidden');
                micBtn.setAttribute('title', 'Stop recording');
                
                // Start timer
                startRecordingTimer();
            })
            .catch(err => {
                console.error('Microphone access denied:', err);
                showError('Microphone access was denied. Please allow microphone access to use voice input.');
            });
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showError('Could not start microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            console.error('Error stopping recognition:', e);
        }
    }
    
    isRecording = false;
    
    // Update UI
    micBtn.classList.remove('bg-red-100', 'text-red-600');
    document.getElementById('mic-icon').classList.remove('animate-pulse');
    document.querySelector('.recording-indicator').classList.add('hidden');
    micBtn.setAttribute('title', 'Start recording');
    
    // Stop timer
    stopRecordingTimer();
}

function startRecordingTimer() {
    recordingStartTime = Date.now();
    updateRecordingTimer();
    recordingTimer = setInterval(updateRecordingTimer, 1000);
}

function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    document.getElementById('recording-time').classList.add('invisible');
}

function updateRecordingTimer() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    const timeElement = document.getElementById('recording-time');
    timeElement.textContent = `${minutes}:${seconds}`;
    timeElement.classList.remove('invisible');
}

function updateWordCount() {
    const text = answerInput.value.trim();
    const wordCount = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
    document.getElementById('word-count').textContent = `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;
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
    updateWordCount();
    currentInterviewType = null;
    currentTechnology = null;
    currentQuestion = null;
    stopRecording();
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

    // Stop recording if it's still active
    if (isRecording) {
        stopRecording();
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

// Check for speech recognition support
function checkSpeechRecognitionSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        // Hide the mic button if not supported
        if (micBtn) micBtn.style.display = 'none';
        
        // Show a message to the user
        const micContainer = document.querySelector('.mic-container');
        if (micContainer) {
            const warning = document.createElement('div');
            warning.className = 'text-sm text-red-600 mt-1';
            warning.textContent = 'Speech recognition is not supported in your browser. Try using Chrome, Edge, or Safari.';
            micContainer.appendChild(warning);
        }
        return false;
    }
    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resetUI();
    showSection(typeSelection);
    
    // Check for speech recognition support
    const isSpeechSupported = checkSpeechRecognitionSupport();
    
    if (isSpeechSupported) {
        // Initialize speech recognition on user interaction
        document.addEventListener('click', function initOnInteraction() {
            initSpeechRecognition();
            document.removeEventListener('click', initOnInteraction);
        }, { once: true });
        
        // Add click handler for mic button
        if (micBtn) {
            micBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleRecording();
            });
        }
    }
    
    // Add click handler for clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            answerInput.value = '';
            updateWordCount();
            answerInput.focus();
        });
    }
    
    // Update word count when typing
    if (answerInput) {
        answerInput.addEventListener('input', updateWordCount);
    }
});