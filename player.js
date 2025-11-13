export class Player {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }

  addScore() {
    this.score++;
  }

  resetScore() {
    this.score = 0;
  }
}
