const canvas = document.getElementById("mazeCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const cellSize = 40;

// Labyrinthe : 1 = mur, 0 = chemin, 2 = question
const maze = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], // 1
  [1, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1], // 2
  [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1], // 3
  [1, 1, 1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 1], // 4
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 1], // 5
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1], // 6
  [1, 0, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1], // 7
  [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // 8
  [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 9
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // 10
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1], // 11
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 2, 1, 1, 1, 1, 1], // 12
  [1, 0, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 0, 0], // 13
  [1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 14
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 15   // sortie en bas à droite
  // 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14
];

// Joueur
let player = { row: 0, col: 0 };

// Dérive lignes/colonnes depuis les données du labyrinthe (évite les tailles codées en dur)
const rows = maze.length;
const cols = maze[0].length;

// Assure que le canvas correspond aux dimensions du labyrinthe
if (canvas) {
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
}

// 8 questions dans le labyrinthe
const questions = {
  "2,4": {
    text: "L’IA est toujours neutre et objective.", //
    correct: false,
    explanation: "L’IA peut être biaisée selon les données utilisées.",
  },
  "4,8": {
    text: "Un réseau de neurones artificiels est identique au cerveau humain.", //
    correct: false,
    explanation: "C’est une inspiration, mais beaucoup plus simple.",
  },
  "7,2": {
    text: "L’IA apprend grâce aux données d’entraînement.", //
    correct: true,
    explanation: "Sans données, pas d’apprentissage.",
  },
  "14,2": {
    text: "Toutes les IA savent expliquer leurs décisions.", //
    correct: false,
    explanation: "Beaucoup de modèles sont des 'boîtes noires'.",
  },
  "5,13": {
    text: "Les biais dans l’IA viennent souvent des données humaines.", //
    correct: true,
    explanation: "Les données reflètent nos biais.",
  },
  "12,9": {
    text: "L’IA peut dépasser l’humain dans toutes les tâches.",
    correct: false,
    explanation: "Elle est spécialisée dans des domaines précis.",
  },
  "13,6": {
    text: "Le Machine Learning est une sous-catégorie de l’IA.",
    correct: true,
    explanation: "L’IA est le champ global, le ML en est une branche.",
  },
  "7,7": {
    text: "Une IA peut fonctionner parfaitement sans supervision ni réglage humain.",
    correct: false,
    explanation: "Une IA nécessite suivi, réglages et validation humaine.",
  },
};

// Stocke les réponses de l'utilisateur : clé -> { answer: boolean, correct: boolean }
const userAnswers = {};

// Interface utilisateur
const questionEl = document.getElementById("question");
const feedbackEl = document.getElementById("feedback-text");
const infoWrap = document.getElementById("infoQuestion");
const trueBtn = document.getElementById("trueBtn");
const falseBtn = document.getElementById("falseBtn");
const startBtn = document.getElementById("startBtn");
const miraEl = document.getElementById("mira");
const viraEl = document.getElementById("vira");
const score = document.getElementById("score");

let feedbackTimeout = null;
// Position da última pergunta respondida (ou null)
let lastAnsweredPos = null;

let scoreValue = 0;
score.textContent = `Score: ${scoreValue}/${Object.keys(questions).length}`;

trueBtn.style.display = "none";
falseBtn.style.display = "none";
// Inicializar a caixa de feedback sempre com o prefixo INFO : e classe cinzenta
if (feedbackEl) {
  feedbackEl.textContent = "INFO :";
  feedbackEl.classList.add("info-text");
}

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
        ctx.fillStyle = "#4444aa"; /* case question */
      } else if (r === rows - 1 && c === cols - 1) {
        // case de sortie (bas-droite)
        if (Object.keys(userAnswers).length === Object.keys(questions).length) {
          ctx.fillStyle = "#228B22"; // case sortie validée
        } else {
          ctx.fillStyle = "#aa4444"; // case sortie non validée
        }
      } else {
        ctx.fillStyle = "#222";
      }
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
  }

  // joueur (dessiné comme une bille)
  const centerX = player.col * cellSize + cellSize / 2;
  const centerY = player.row * cellSize + cellSize / 2;
  const radius = Math.min(cellSize, cellSize) * 0.42;

  ctx.save();
  ctx.fillStyle = "#4dd0e1";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  // bordure
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.stroke();
  ctx.restore();
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

      // Se o jogador deixou a célula da última pergunta respondida, limpar o painel de info
      if (lastAnsweredPos) {
        const [lr, lc] = lastAnsweredPos.split(",").map(Number);
        if (lr !== player.row || lc !== player.col) {
          // limpar feedback e esconder o painel
          if (feedbackEl) {
            feedbackEl.textContent = "INFO :";
            feedbackEl.classList.add("info-text");
          }
          if (infoWrap) infoWrap.classList.remove("show");
          // limpar a pergunta visível e esconder os botões de escolha
          if (questionEl) questionEl.textContent = "";
          if (trueBtn) trueBtn.style.display = "none";
          if (falseBtn) falseBtn.style.display = "none";
          // resetar textos das personagens
          if (miraEl) miraEl.textContent = "MIRA :";
          if (viraEl) viraEl.textContent = "VIRA :";
          lastAnsweredPos = null;
        }
      }

      // Vérifie si la case contient une question
      if (maze[newRow][newCol] === 2) {
        askQuestion(newRow, newCol);
      }

      // Vérifie la sortie
      if (
        newRow === rows - 1 &&
        newCol === cols - 1 &&
        Object.keys(userAnswers).length === Object.keys(questions).length
      ) {
        showQuestions();
        questionEl.textContent =
          "🎉 Bravo ! Tu as atteint la sortie du labyrinthe.";
        document.removeEventListener("keydown", handleMovement);
      } else if (
        newRow === rows - 1 &&
        newCol === cols - 1 &&
        Object.keys(userAnswers).length < Object.keys(questions).length
      ) {
        questionEl.textContent =
          "Tu ne peux pas finir sans répondre à tout. 😜";
      }
    }
  }
}

function askQuestion(r, c) {
  const key = `${r},${c}`;
  const q = questions[key];
  if (!q) return;

  // Masque tout retour précédent pendant l'affichage de la question
  if (infoWrap) {
    // Conserver la zone d'info comme espace réservé ; ne pas retirer la classe .show
    // Afficher un message si vide pour éviter une zone Info: vide
    if (!feedbackEl.textContent || feedbackEl.textContent.trim() === "") {
      feedbackEl.textContent = "INFO : Réponds pour voir l'explication ici.";
      feedbackEl.classList.add("info-text");
    }
  }

  questionEl.textContent = q.text;
  trueBtn.style.display = "inline-block";
  falseBtn.style.display = "inline-block";
  // Conserver les labels MIRA / VIRA et définir des valeurs par défaut si nécessaire
  if (!miraEl.textContent || miraEl.textContent.trim() === "")
    miraEl.textContent = "MIRA :";
  if (!viraEl.textContent || viraEl.textContent.trim() === "")
    viraEl.textContent = "VIRA :";

  // Désactiver les touches de déplacement pendant la question
  document.removeEventListener("keydown", handleMovement);
  trueBtn.onclick = () => checkAnswer(true, q, r, c);
  falseBtn.onclick = () => checkAnswer(false, q, r, c);
}

function checkAnswer(answer, q, r, c) {
  // Enregistre la réponse et si elle est correcte
  const wasCorrect = answer === q.correct;
  userAnswers[`${r},${c}`] = { answer: answer, correct: wasCorrect };

  // Affiche l'explication
  feedbackEl.textContent = `INFO : ${q.explanation}`;
  feedbackEl.classList.add("info-text");
  // Montre la carte d'info jusqu'à la prochaine question
  if (infoWrap) {
    infoWrap.classList.add("show");
  }
  // memorizar a posição da última pergunta respondida
  lastAnsweredPos = `${r},${c}`;
  if (wasCorrect) {
    miraEl.textContent = "MIRA : Bravo, tu avances !";
    viraEl.textContent = "VIRA : Hmm, pas mal... Je suppose que tu as raison.";
    scoreValue++;
  } else {
    miraEl.textContent =
      "MIRA : Oh, c’est faux, mais vous pouvez voir dans l’info une petite explication!";
    viraEl.textContent = "VIRA : On dirait que quelqu’un n’a pas étudié!";
  }

  // Marque la case comme visitée (devient chemin)
  maze[r][c] = 0;

  // Réactive les touches de déplacement
  document.addEventListener("keydown", handleMovement);

  score.textContent = `Score: ${scoreValue}/${Object.keys(questions).length}`;

  trueBtn.style.display = "none";
  falseBtn.style.display = "none";
}

function showQuestions() {
  // Mostrar resultados em modal com score e lista de perguntas
  const modal = document.getElementById("resultsModal");
  const finalScore = document.getElementById("finalScore");
  const resultsList = document.getElementById("resultsList");
  if (!modal || !finalScore || !resultsList) return;
  finalScore.textContent = `Score: ${scoreValue}/${
    Object.keys(questions).length
  }`;
  resultsList.innerHTML = "";
  for (const key in questions) {
    const q = questions[key];
    const ua = userAnswers[key];
    const item = document.createElement("div");
    item.className = "result-item";
    const correct = ua && ua.correct;
    const status = correct ? "correct" : "incorrect";
    const userAnsText = ua ? (ua.answer ? "Vrai" : "Faux") : "Pas répondu";
    item.innerHTML = `
      <div><strong>Q:</strong> ${q.text}</div>
      <div><strong>Réponse:</strong> ${q.correct ? "Vrai" : "Faux"}</div>
      <div><strong>Ta réponse:</strong> ${userAnsText} <span class="${status}">(${
      ua ? (ua.correct ? "✓ correct" : "✗ incorrect") : "—"
    })</span></div>
      <div class="explanation"><em>${q.explanation}</em></div>
    `;
    resultsList.appendChild(item);
  }
  modal.hidden = false;

  const closeBtn = document.getElementById("closeResults");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const modal = document.getElementById("resultsModal");

      modal.style.display = "none";

      drawMaze();
    });
  }
}

// Empêche les flèches de faire défiler la page
window.addEventListener(
  "keydown",
  function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  },
  false
);
