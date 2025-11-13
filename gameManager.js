import { Player } from "./player.js";

export class GameManager {
  constructor() {
    this.player = null;
    this.correctAnswer = 0;

    this.timer = null;
    this.timeLeft = 10;

    this.isTimeUp = false;
    this.hasAnswered = false;

    // Background music
    this.bgMusic = new Audio("assets/bg-music.mp3");
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;
  }

  // START GAME
  startGame(name) {
    this.player = new Player(name);

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("welcomeMsg").textContent = `Welcome, ${name}!`;

    this.bgMusic.play();

    document.getElementById("leaderboard").innerHTML = "";
    this.loadPuzzle();
  }

  // LOAD PUZZLE FROM API
  async loadPuzzle() {
    try {
      const response = await fetch("https://marcconrad.com/uob/heart/api.php");
      const data = await response.json();

      document.getElementById("puzzleImage").src = data.question;
      this.correctAnswer = data.solution;

      document.getElementById("feedback").textContent = "";
      document.getElementById("answerInput").value = "";
      document.getElementById("score").textContent = `Score: ${this.player.score}`;

      document.getElementById("answerInput").disabled = false;
      document.getElementById("submitBtn").disabled = false;

      this.isTimeUp = false;
      this.hasAnswered = false;

      this.startTimer();
    } catch (error) {
      document.getElementById("feedback").textContent = "Error loading puzzle.";
    }
  }

  // TIMER
  startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 10;
    this.isTimeUp = false;

    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = `Time Left: ${this.timeLeft}s`;

    this.timer = setInterval(() => {
      this.timeLeft--;
      timerDisplay.textContent = `Time Left: ${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.isTimeUp = true;

        document.getElementById("feedback").textContent =
          `⏰ Time's up! Correct answer: ${this.correctAnswer}`;

        document.getElementById("answerInput").disabled = true;
        document.getElementById("submitBtn").disabled = true;
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  // SUBMIT ANSWER
  submitAnswer() {
    if (this.isTimeUp) {
      document.getElementById("feedback").textContent =
        "⏰ Time is up! Cannot submit.";
      return;
    }

    if (this.hasAnswered) {
      document.getElementById("feedback").textContent =
        "⚠️ Already submitted.";
      return;
    }

    this.stopTimer();
    this.hasAnswered = true;

    const userAnswer = parseInt(document.getElementById("answerInput").value);
    const feedback = document.getElementById("feedback");

    if (isNaN(userAnswer)) {
      feedback.textContent = "⚠️ Enter a number!";
      this.hasAnswered = false;
      return;
    }

    if (userAnswer === this.correctAnswer) {
      feedback.textContent = "✅ Correct!";
      this.player.addScore();
    } else {
      feedback.textContent = `❌ Wrong! Correct: ${this.correctAnswer}`;
    }

    document.getElementById("score").textContent = `Score: ${this.player.score}`;

    this.saveScore();
    this.showLeaderboard();

    document.getElementById("answerInput").disabled = true;
    document.getElementById("submitBtn").disabled = true;
  }

  // SAVE SCORE
  saveScore() {
    const scores = JSON.parse(localStorage.getItem("heartGameScores")) || [];

    const existing = scores.find(s => s.name === this.player.name);

    if (existing) {
      existing.score = this.player.score;
    } else {
      scores.push({ name: this.player.name, score: this.player.score });
    }

    localStorage.setItem("heartGameScores", JSON.stringify(scores));
  }

  // SHOW LEADERBOARD
  showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("heartGameScores")) || [];
    let html = "<h3>🏆 Leaderboard</h3><ol>";

    scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach(entry => {
        html += `<li>${entry.name}: ${entry.score}</li>`;
      });

    html += "</ol>";
    document.getElementById("leaderboard").innerHTML = html;
  }

  // LOGOUT
  logout() {
    this.stopTimer();

    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;

    document.getElementById("answerInput").value = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("timer").textContent = "";
    document.getElementById("leaderboard").innerHTML = "";
    document.getElementById("score").textContent = "";

    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";

    this.isTimeUp = false;
    this.hasAnswered = false;
  }
}
