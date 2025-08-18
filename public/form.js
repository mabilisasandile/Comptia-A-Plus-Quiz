document.addEventListener("DOMContentLoaded", () => {

  // Get elements
  const modal = document.getElementById("signinModal");
  const openBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementById("closeModal");
  const errorMsg = document.getElementById("errorMsg");
  const adminSection = document.getElementById("adminSection");

  // Hard-coded credentials
  const ADMIN_USER = "sandile";
  const ADMIN_PASS = "admin@12345";

  // Open modal
  openBtn.onclick = () => {
    modal.style.display = "flex"; // use flex to center
  };

  // Close modal
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  // Close if user clicks outside modal content
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Handle form submit
  document.getElementById("signinForm").addEventListener("submit", (e) => {
    e.preventDefault(); // stop page reload
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      modal.style.display = "none";   // close modal
      adminSection.style.display = "block"; // show admin form
      errorMsg.textContent = "";      // clear error
    } else {
      errorMsg.textContent = "Invalid username or password!";
    }
  });


  const form = document.getElementById("add-question-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const questionText = document.getElementById("new-question").value.trim();
    const answerInputs = document.querySelectorAll(".answer");
    const correctChecks = document.querySelectorAll(".correct");
    const multipleCorrectAnswers = document.querySelector(".multiple");
    const explanationText = document.getElementById("explanation").value.trim();

    const answers = Array.from(answerInputs)
      .map((input, i) => ({
        text: input.value.trim(),
        correct: correctChecks[i].checked
      }))
      .filter(answer => answer.text !== ""); // keep only filled answers


    const newQuestion = {
      question: questionText,
      answers,
      multiple: multipleCorrectAnswers.checked ? true : false,
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
