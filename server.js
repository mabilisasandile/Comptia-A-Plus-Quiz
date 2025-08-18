const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://mabilisasandile.github.io/Comptia-A-Plus-Quiz/public/form.html'], // allow only this origins
  methods: ['GET', 'POST', 'PUT'],        // allow only specific methods
  allowedHeaders: ['Content-Type'] // allow specific headers
}));

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/add-question", (req, res) => {
  const newQuestion = req.body;
  console.log("Received new question:", newQuestion);

  const pathToFile = "public/questions.json";

  fs.readFile(pathToFile, "utf8", (err, data) => {
    if (err) {
      console.error("Read error:", err); 
      return res.status(500).send("Error reading questions");
    }

    let questions = [];
    try {
      questions = JSON.parse(data);
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
      return res.status(500).send("Invalid JSON format");
    }

    questions.push(newQuestion);

    fs.writeFile(pathToFile, JSON.stringify(questions, null, 2), err => {
      if (err) {
        console.error("Write error:", err);
        return res.status(500).send("Error saving question");
      } else {
        console.log("Question added to file ✅");
        return res.status(200).send("Question added");
      }
    });
  });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
