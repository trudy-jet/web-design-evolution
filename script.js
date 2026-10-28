
"use strict";

// Quiz settings
const QUIZ_DURATION = 10 * 60;
const PASSING_SCORE = 7;

// Get HTML elements
const quizForm = document.getElementById("quiz-form");
const results = document.getElementById("results");
const timerDisplay = document.getElementById("timer");
const submitButton = document.getElementById("submit-btn");

// Answers and descriptions for result feedback
const questions = [
    {
        id: "q1",
        type: "single",
        answer: "b",
        explanation: "Flashing text and animated GIFs"
    },
    {
        id: "q2",
        type: "single",
        answer: "c",
        explanation: "CSS"
    },
    {
        id: "q3",
        type: "single",
        answer: "a",
        explanation: "Adapt layouts to different screen sizes"
    },
    {
        id: "q4",
        type: "text",
        answer: "hypertext markup language",
        explanation: "HyperText Markup Language"
    },
    {
        id: "q5",
        type: "text",
        answer: "javascript",
        explanation: "JavaScript"
    },
    {
        id: "q6",
        type: "multiple",
        answer: ["a", "b", "d"],
        explanation: "Responsive layouts, mobile-friendly navigation, and accessibility features"
    },
    {
        id: "q7",
        type: "single",
        answer: "b",
        explanation: "HTML"
    },
    {
        id: "q8",
        type: "single",
        answer: "b",
        explanation: "2000s"
    },
    {
        id: "q9",
        type: "single",
        answer: "b",
        explanation: "Control visual appearance and layout"
    },
    {
        id: "q10",
        type: "single",
        answer: "c",
        explanation: "Mobile-first design"
    }
];

// Timer variables
let startTime;
let timerInterval;
let quizFinished = false;

// Format seconds into minutes and seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Calculate elapsed time using the clock.
// This avoids losing accuracy when browser timers are delayed.
function getElapsedSeconds() {
    return Math.min(
        QUIZ_DURATION,
        Math.floor((Date.now() - startTime) / 1000)
    );
}

// Start or restart the countdown
function startTimer() {
    clearInterval(timerInterval);

    startTime = Date.now();
    timerDisplay.textContent = "Time Remaining: 10:00";
    timerDisplay.classList.remove("timer-warning");

    timerInterval = setInterval(updateTimer, 250);
}

// Update the visible timer
function updateTimer() {
    if (quizFinished) return;

    const remaining = Math.max(
        0,
        QUIZ_DURATION - getElapsedSeconds()
    );

    timerDisplay.textContent =
        `Time Remaining: ${formatTime(remaining)}`;

    // Warn the user during the final minute
    if (remaining <= 60) {
        timerDisplay.classList.add("timer-warning");
    }

    // Automatically submit at zero
    if (remaining === 0) {
        finishQuiz(true);
    }
}

// Normalize text answers
function normalizeText(value) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

// Get the answer selected by the user
function getUserAnswer(question) {
    if (question.type === "text") {
        return normalizeText(
            quizForm.elements[question.id].value
        );
    }

    if (question.type === "multiple") {
        return Array.from(
            quizForm.querySelectorAll(
                `input[name="${question.id}"]:checked`
            )
        ).map(input => input.value).sort();
    }

    const selected = quizForm.querySelector(
        `input[name="${question.id}"]:checked`
    );

    if (selected) {
        return selected.value;
    }

    // Dropdowns are selected using their value
    const control = quizForm.elements[question.id];

    if (control && control.tagName === "SELECT") {
        return control.value;
    }

    return "";
}

// Compare the user's answer with the correct one
function isCorrect(question, userAnswer) {
    if (question.type === "multiple") {
        return JSON.stringify(userAnswer) ===
               JSON.stringify([...question.answer].sort());
    }

    return userAnswer === question.answer;
}

// Grade the quiz and display complete feedback
function finishQuiz(timeExpired = false) {
    if (quizFinished) return;

    // Calculate time before stopping the timer
    const elapsed = getElapsedSeconds();

    quizFinished = true;
    clearInterval(timerInterval);

    let score = 0;
    let feedbackHTML = "";

    questions.forEach((question, index) => {
        const userAnswer = getUserAnswer(question);
        const correct = isCorrect(question, userAnswer);

        if (correct) {
            score++;
        }

        const status = correct ? "Correct" : "Incorrect";
        const statusClass = correct ? "correct" : "incorrect";

        // Each question gets individual feedback
        feedbackHTML += `
            <div class="question-result ${statusClass}">
                <h3>Question ${index + 1}</h3>
                <p><strong>Result:</strong> ${status}</p>
                <p><strong>Score:</strong> ${correct ? 1 : 0}/1</p>
                <p><strong>Correct answer:</strong>
                    ${question.explanation}</p>
            </div>
        `;
    });

    const passed = score >= PASSING_SCORE;
    const percentage = Math.round(
        (score / questions.length) * 100
    );

    // Display final grade and results
    results.innerHTML = `
        <div class="score-summary ${passed ? "passed" : "failed"}">
            <h2>Quiz Results</h2>

            ${timeExpired
                ? "<p>Time expired! Your quiz was submitted automatically.</p>"
                : ""}

            <p class="final-score">${percentage}%</p>

            <p><strong>Total Score:</strong>
                ${score} / ${questions.length}</p>

            <p class="pass-status">
                ${passed ? "PASS!" : "FAIL - Keep studying!"}
            </p>

            <p><strong>Time Spent:</strong>
                ${formatTime(elapsed)}</p>
        </div>

        <h2>Question-by-Question Results</h2>

        ${feedbackHTML}

        <button type="button" id="retake-btn">
            Retake Quiz
        </button>
    `;

    results.hidden = false;

    // Prevent answers from changing after submission
    quizForm.querySelectorAll("input, select, button")
        .forEach(element => {
            element.disabled = true;
        });

    timerDisplay.textContent = timeExpired
        ? "Time Remaining: 0:00"
        : "Quiz Completed";

    // Move the viewport to the results
    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Process manual submission
quizForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // Enforce the deadline, even if the timer callback was delayed
    finishQuiz(getElapsedSeconds() >= QUIZ_DURATION);
});

// Clear everything and begin a new attempt
function resetQuiz() {
    clearInterval(timerInterval);

    quizForm.reset();

    quizForm.querySelectorAll("input, select, button")
        .forEach(element => {
            element.disabled = false;
        });

    results.innerHTML = "";
    results.hidden = true;

    quizFinished = false;

    startTimer();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Retake button is created dynamically in results
results.addEventListener("click", function(event) {
    if (event.target.id === "retake-btn") {
        resetQuiz();
    }
});

// Start automatically when the page loads
startTimer();
