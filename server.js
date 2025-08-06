const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/add-question", (req, res) => {
  const newQuestion = req.body;
  fs.readFile("public/questions.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading questions");

    let questions = JSON.parse(data);
    questions.push(newQuestion);

    fs.writeFile("public/questions.json", JSON.stringify(questions, null, 2), err => {
      if (err) return res.status(500).send("Error saving question");
      res.status(200).send("Question added");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
