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
  const coreSelect = document.getElementById("core-number");
  const startRangeBtn = document.getElementById("start-range-quiz");
  const downloadButton = document.getElementById("download-btn");

  const toggleAnswerBtn = document.getElementById("toggle-answer-btn");
  const explanationElement = document.getElementById("answer-explanation");

  let scoredQuestions = new Set(); // store question indexes that have been scored

  startRangeBtn.addEventListener("click", () => {
    const range = rangeSelect.value;
    const [start, end] = range.split("-").map(Number);
    questions = allQuestions.slice(start - 1, end);
    startQuiz();
  });

  nextButton.addEventListener("click", handleNextButton);

  startRangeBtn.addEventListener("click", () => {
    const range = rangeSelect.value;
    const [start, end] = range.split("-").map(Number);

    // Fetch questions based on selected core
    const coreFile = coreSelect.value === "220-1202" ? "questions2.json" : "questions.json";
    fetch(coreFile)
      .then(res => res.json())
      .then(data => {
        allQuestions = data;
        questions = allQuestions.slice(start - 1, end);
        startQuiz();
      })
      .catch(err => {
        console.error("Failed to load questions:", err);
        questionElement.innerText = "Error loading quiz.";
      });
  });

  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    scoredQuestions.clear();
    nextButton.innerText = "Next";
    downloadButton.style.display = "none";
    showQuestion();
  }

  function showQuestion() {
    resetState();

    const currentQuestion = questions[currentQuestionIndex];
    questionNumberElement.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionElement.innerText = currentQuestion.question;

    const inputType = currentQuestion.multiple ? "checkbox" : "radio";
    const name = currentQuestion.multiple ? `answer${currentQuestionIndex}[]` : "answer";

    currentQuestion.answers.forEach((answer, index) => {
      const wrapper = document.createElement("label");
      wrapper.classList.add("answer-option");

      const input = document.createElement("input");
      input.type = inputType;
      input.name = name;
      input.value = index;

      const span = document.createElement("span");
      span.innerText = answer.text;

      wrapper.appendChild(input);
      wrapper.appendChild(span);

      if (answer.correct) wrapper.dataset.correct = "true";

      nextButton.disabled = true;

      input.addEventListener("change", () => {
        toggleAnswerBtn.style.display = "inline-block";
        nextButton.style.display = "inline-block";
        nextButton.disabled = false;
      });

      answerButtonsElement.appendChild(wrapper);
    });

    // Reset explanation + buttons
    explanationElement.style.display = "none";
    explanationElement.innerText = "";
    toggleAnswerBtn.style.display = "none";
    toggleAnswerBtn.innerText = "SHOW ANSWER";
    nextButton.style.display = "none"; // 🔹 hide NEXT until answered
  }


  function resetState() {
    nextButton.style.display = "none";
    while (answerButtonsElement.firstChild) {
      answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
  }

  function scoreCurrentQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const allWrappers = Array.from(answerButtonsElement.children);

    if (!scoredQuestions.has(currentQuestionIndex)) {
      if (currentQuestion.multiple) {
        const correctIndexes = currentQuestion.answers
          .map((a, i) => a.correct ? i : -1)
          .filter(i => i !== -1);
        const selectedIndexes = allWrappers
          .map((w, i) => w.querySelector("input").checked ? i : -1)
          .filter(i => i !== -1);

        const allCorrectSelected = correctIndexes.every(i => selectedIndexes.includes(i));
        const noExtraSelected = selectedIndexes.every(i => correctIndexes.includes(i));

        if (allCorrectSelected && noExtraSelected) score++;
      } else {
        const selected = allWrappers.find(w => w.querySelector("input").checked);
        if (selected && selected.dataset.correct === "true") score++;
      }
      scoredQuestions.add(currentQuestionIndex);
    }
  }

  // Show/hide answer logic
  toggleAnswerBtn.addEventListener("click", () => {
    const currentQuestion = questions[currentQuestionIndex];
    const allWrappers = Array.from(answerButtonsElement.children);

    if (explanationElement.style.display === "none") {
      // Show correctness
      allWrappers.forEach(wrapper => {
        const input = wrapper.querySelector("input");
        const isCorrect = wrapper.dataset.correct === "true";
        const isSelected = input.checked;

        if (isCorrect) wrapper.classList.add("correct");
        else if (isSelected && !isCorrect) wrapper.classList.add("wrong");

        input.disabled = true;
      });

      // Update score
      scoreCurrentQuestion();


      // Show explanation
      explanationElement.innerText =
        `Correct Answer(s): ${currentQuestion.answers.filter(a => a.correct).map(a => a.text).join(", ")}\n\n` +
        `Explanation: ${currentQuestion.explanation || "No explanation available."}`;
      explanationElement.style.display = "block";

      toggleAnswerBtn.innerText = "HIDE ANSWER";
      nextButton.style.display = "inline-block";

    } else {
      explanationElement.style.display = "none";
      toggleAnswerBtn.innerText = "SHOW ANSWER";
    }
  });

  function handleNextButton() {
    scoreCurrentQuestion(); // score updates even without viewing explanation
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showScore();
    }
  }

  // Show score at end
  function showScore() {
    resetState();
    const resultText = `Quiz completed! Your score: ${score}/${questions.length}\nFinal Result: ${(score / questions.length * 100).toFixed(2)}%`;
    questionElement.innerText = resultText;
    localStorage.setItem("lastScore", score);

    nextButton.innerText = "Restart Quiz";
    nextButton.style.display = "inline-block";

    nextButton.onclick = () => {
      startQuiz();
      nextButton.onclick = handleNextButton; // restore original NEXT behavior
    };

    downloadButton.style.display = "inline-block";

    downloadButton.onclick = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const finalScore = (score / questions.length * 100).toFixed(2); // optional: format as 2 decimals

      doc.text([
        "CompTIA A+ Quiz Results",
        `Score: ${score} out of ${questions.length}`,
        `Final Result: ${finalScore}%`
      ], 10, 10);

      doc.save("quiz-results.pdf");
    };
  }

});