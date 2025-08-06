document.addEventListener("DOMContentLoaded", () => {

  let questions = [];

  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data;
      startQuiz();
    })
    .catch(error => {
      console.error("Failed to load questions:", error);
      questionElement.innerText = "Failed to load quiz questions.";
    });


  const questionElement = document.getElementById("question");
  const answerButtonsElement = document.getElementById("answer-buttons");
  const nextButton = document.getElementById("next-btn");
  const downloadButton = document.getElementById("download-btn");

  let currentQuestionIndex = 0;
  let score = 0;

  // NEXT button control
  nextButton.addEventListener("click", handleNextButton);

  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerText = "Next";
    downloadButton.style.display = "none";
    showQuestion();
  }

  // function showQuestion() {
  //   resetState();
  //   let currentQuestion = questions[currentQuestionIndex];
  //   questionElement.innerText = currentQuestion.question;

  //   currentQuestion.answers.forEach(answer => {
  //     const button = document.createElement("button");
  //     button.innerText = answer.text;
  //     button.classList.add("btn");
  //     if (answer.correct) button.dataset.correct = answer.correct;
  //     button.addEventListener("click", selectAnswer);
  //     answerButtonsElement.appendChild(button);
  //   });
  // }
  function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];

    // Update question number display
    const questionNumberElement = document.getElementById("question-number");
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Show actual question
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
    answerButtonsElement.innerHTML = "";
  }

  function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";

    Array.from(answerButtonsElement.children).forEach(button => {
      const isCorrect = button.dataset.correct === "true";
      button.classList.add(isCorrect ? "correct" : "wrong");
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


  document.getElementById("add-question-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const questionText = document.getElementById("new-question").value;
    const answerInputs = document.querySelectorAll(".answer");
    const correctChecks = document.querySelectorAll(".correct");

    const answers = Array.from(answerInputs).map((input, i) => ({
      text: input.value,
      correct: correctChecks[i].checked
    }));

    const newQuestion = { question: questionText, answers };

    fetch("/add-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuestion)
    })
      .then(res => res.text())
      .then(msg => {
        document.getElementById("submit-status").textContent = "✅ " + msg;
        document.getElementById("add-question-form").reset();
      })
      .catch(err => {
        document.getElementById("submit-status").textContent = "❌ Error saving question.";
        console.error(err);
        console.log("Failed to add new question: ", err);
      });
  });

  window.onload(startQuiz());

});