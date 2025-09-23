const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const cellSize = 40;
const rows = 10;
const cols = 10;

// Labyrinthe : 1 = mur, 0 = chemin, 2 = question
const maze = [
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 2, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 2, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 2, 1],
  [1, 0, 0, 2, 1, 1, 1, 0, 0, 1],
  [1, 2, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 2, 0], // sortie en bas à droite
];

// Joueur
let player = { row: 0, col: 0 };

// 8 questions dans le labyrinthe
const questions = {
  "3,1": {
    text: "L’IA est toujours neutre et objective.",
    correct: false,
    explanation:
      "L’IA peut être biaisée selon les données utilisées.",
  },
  "5,6": {
    text: "Un réseau de neurones artificiels est identique au cerveau humain.",
    correct: false,
    explanation: "C’est une inspiration, mais beaucoup plus simple.",
  },
  "6,8": {
    text: "L’IA apprend grâce aux données d’entraînement.",
    correct: true,
    explanation: "Sans données, pas d’apprentissage.",
  },
  "7,3": {
    text: "Toutes les IA savent expliquer leurs décisions.",
    correct: false,
    explanation: "Beaucoup de modèles sont des 'boîtes noires'.",
  },
  "8,1": {
    text: "Les biais dans l’IA viennent souvent des données humaines.",
    correct: true,
    explanation: "Les données reflètent nos biais.",
  },
  "9,8": {
    text: "L’IA peut dépasser l’humain dans toutes les tâches.",
    correct: false,
    explanation: "Elle est spécialisée dans des domaines précis.",
  },
  "1,3": {
    text: "Le Machine Learning est une sous-catégorie de l’IA.",
    correct: true,
    explanation:
      "L’IA est le champ global, le ML en est une branche.",
  },
  "4,2": {
    text: "Une IA peut fonctionner parfaitement sans supervision ni réglage humain.",
    correct: false,
    explanation:
      "Une IA nécessite suivi, réglages et validation humaine.",
  },
};

// UI
const questionEl = document.getElementById("question");
const feedbackEl = document.getElementById("feedback-text");
const trueBtn = document.getElementById("trueBtn");
const falseBtn = document.getElementById("falseBtn");
const startBtn = document.getElementById("startBtn");
const miraEl = document.getElementById("mira");
const viraEl = document.getElementById("vira");

trueBtn.style.display = "none";
falseBtn.style.display = "none";

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  drawMaze();
  document.addEventListener("keydown", handleMovement);
  questionEl.textContent = "Utilise les flèches ⬆️⬇️⬅️➡️ pour avancer.";
});

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === 1) {
        ctx.fillStyle = "#333";
      } else if (maze[r][c] === 2) {
        ctx.fillStyle = "#4444aa"; // case question
      } else {
        ctx.fillStyle = "#222";
      }
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
  }

  // joueur
  ctx.fillStyle = "#4dd0e1";
  ctx.fillRect(
    player.col * cellSize,
    player.row * cellSize,
    cellSize,
    cellSize
  );
}

function handleMovement(e) {
  let newRow = player.row;
  let newCol = player.col;

  if (e.key === "ArrowUp") newRow--;
  if (e.key === "ArrowDown") newRow++;
  if (e.key === "ArrowLeft") newCol--;
  if (e.key === "ArrowRight") newCol++;

  if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
    if (maze[newRow][newCol] !== 1) {
      player.row = newRow;
      player.col = newCol;
      drawMaze();

      // Vérifie si c'est une case question
      if (maze[newRow][newCol] === 2) {
        askQuestion(newRow, newCol);
      }

      // Vérifie sortie
      if (newRow === 9 && newCol === 9) {
        questionEl.textContent =
          "🎉 Bravo ! Tu as atteint la sortie du labyrinthe.";
        document.removeEventListener("keydown", handleMovement);
      }
      
    }
  }
}

function askQuestion(r, c) {
  const key = `${r},${c}`;
  const q = questions[key];
  if (!q) return;

  questionEl.textContent = q.text;
  trueBtn.style.display = "inline-block";
  falseBtn.style.display = "inline-block";
  miraEl.textContent = "";
  viraEl.textContent = "";

  // VIRA intervient aléatoirement
  if (Math.random() > 0.4) {
    viraEl.textContent =
      "🤔 VIRA : Je ne sais pas si à cette allure tu trouveras la sortie !";
  }

  trueBtn.onclick = () => checkAnswer(true, q, r, c);
  falseBtn.onclick = () => checkAnswer(false, q, r, c);
}

function checkAnswer(answer, q, r, c) {
  if (answer === q.correct) {
    feedbackEl.textContent = q.explanation;
    miraEl.textContent = "✨ MIRA : Bravo, tu avances !";
    maze[r][c] = 0; // question validée, devient chemin
  } else {
    feedbackEl.textContent = q.explanation;
    miraEl.textContent = "✨ MIRA : Dommage...ce n'est pas la bonne réponse, voici une petite explication : ";
  }

  trueBtn.style.display = "none";
  falseBtn.style.display = "none";
}
