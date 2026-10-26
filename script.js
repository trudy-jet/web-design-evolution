
"use strict";

// Get the quiz form and results area.
const quizForm = document.getElementById("quiz-form");
const results = document.getElementById("results");

// Store the correct answers for multiple-choice questions.
const answerKey = {
    q1: "b",
    q2: "c",
    q3: "a",
    q7: "b",
    q8: "b",
    q9: "b",
    q10: "c"
};

// This function checks the user's answers.
function checkAnswers() {
    let score = 0;

    // Check multiple-choice and dropdown answers.
    for (const question in answerKey) {
        const selected = quizForm.elements[question].value;

        if (selected === answerKey[question]) {
            score++;
        }
    }

    // Check fill-in-the-blank questions.
    const q4 = document.getElementById("q4").value
        .trim().toLowerCase().replace(/\s+/g, " ");

    const q5 = document.getElementById("q5").value
        .trim().toLowerCase();

    if (q4 === "hypertext markup language") {
        score++;
    }

    if (q5 === "javascript") {
        score++;
    }

    // Check the multi-selection question.
    const q6Answers = Array.from(
        document.querySelectorAll('input[name="q6"]:checked')
    ).map(input => input.value).sort();

    if (JSON.stringify(q6Answers) === JSON.stringify(["a", "b", "d"])) {
        score++;
    }

    return score;
}

// Run grading when the quiz is submitted.
quizForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const score = checkAnswers();
    const passed = score >= 7;

    results.hidden = false;
    results.innerHTML = `
        <h2>Quiz Results</h2>
        <p>You scored ${score} out of 10!</p>
        <p>${passed ? "PASS 🎉" : "FAIL - Keep studying!"}</p>
    `;
});
