document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-question-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const questionText = document.getElementById("new-question").value;
    const answerInputs = document.querySelectorAll(".answer");
    const correctChecks = document.querySelectorAll(".correct");
    const explanationText = document.getElementById("explanation").value;

    const answers = Array.from(answerInputs).map((input, i) => ({
      text: input.value,
      correct: correctChecks[i].checked
    }));

    const newQuestion = { 
      question: questionText, 
      answers, 
      explanation: explanationText 
    };

    fetch("/add-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuestion)
    })
      .then(res => res.text())
      .then(msg => {
        document.getElementById("submit-status").textContent = "✅ " + msg;
        form.reset();
      })
      .catch(err => {
        document.getElementById("submit-status").textContent = "❌ Error saving question.";
        console.error(err);
      });
  });
});
