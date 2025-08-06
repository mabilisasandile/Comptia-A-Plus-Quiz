document.addEventListener("DOMContentLoaded", () => {

  let questions = [];
  let allQuestions = [];
  let currentQuestionIndex = 0;
  let score = 0;


  const questionElement = document.getElementById("question");
  const answerButtonsElement = document.getElementById("answer-buttons");
  const nextButton = document.getElementById("next-btn");
  const questionNumberElement = document.getElementById("question-number");

  const rangeSelect = document.getElementById("question-range");
  const startRangeBtn = document.getElementById("start-range-quiz");
  const downloadButton = document.getElementById("download-btn");


  // Load all questions from JSON
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      allQuestions = data;
      // Wait for user to choose range
    })
    .catch(err => {
      console.error("Failed to load questions:", err);
      questionElement.innerText = "Error loading quiz.";
    });


  startRangeBtn.addEventListener("click", () => {
    const range = rangeSelect.value; // e.g., "1-50"
    const [start, end] = range.split("-").map(Number);

    // Filter and slice questions based on selected range
    questions = allQuestions.slice(start - 1, end);
    startQuiz();
  });


  // NEXT button control
  nextButton.addEventListener("click", handleNextButton);


  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerText = "Next";
    downloadButton.style.display = "none";
    showQuestion();
  }


  function showQuestion() {
    resetState();

    const currentQuestion = questions[currentQuestionIndex];
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionElement.innerText = currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
      const button = document.createElement("button");
      button.innerText = answer.text;
      button.classList.add("btn");
      if (answer.correct) button.dataset.correct = answer.correct;
      button.addEventListener("click", selectAnswer);
      answerButtonsElement.appendChild(button);
    });
  }


  function resetState() {
    nextButton.style.display = "none";
    while (answerButtonsElement.firstChild) {
      answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
  }


  function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === "true";

  Array.from(answerButtonsElement.children).forEach(button => {
    const isCorrect = button.dataset.correct === "true";

    // Reset button content
    let label = button.innerText;

    if (isCorrect) {
      label += " ✔️";
      button.classList.add("correct");
    } else {
      if (button === selectedButton) label += " ✖️";
      button.classList.add("wrong");
    }

    button.innerText = label;
    button.disabled = true;
  });

  if (correct) score++;
  nextButton.style.display = "inline-block";
}
  

  function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showScore();
    }
  }


  function showScore() {
    resetState();
    const resultText = `Quiz completed! Your score: ${score}/${questions.length}`;
    questionElement.innerText = resultText;
    localStorage.setItem("lastScore", score);

    nextButton.innerText = "Restart Quiz";
    nextButton.style.display = "inline-block";
    downloadButton.style.display = "inline-block";

    // PDF generation
    downloadButton.onclick = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text("CompTIA A+ Quiz Results", 10, 10);
      doc.text(`Score: ${score} out of ${questions.length}`, 10, 20);
      doc.save("quiz-results.pdf");
    };
  }


});