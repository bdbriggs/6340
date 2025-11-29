let player;
let foods = [];
let poisons = [];

let poisonHits = 0;
let gameOver = false;

let numFoods = 20;
let numPoison = 8;
let score = 0;

function setup() {
  // Mount canvas to the game container (check for both possible container IDs)
  let container = select('#game-canvas-container') || select('#game-chomper');
  let canvas = createCanvas(800, 600);
  if (container) {
    canvas.parent(container);
  }

  player = new Player(width / 2, height / 2, 30);

  for (let i = 0; i < numFoods; i++) {
    foods.push(new Food(random(width), random(height), random(10, 18)));
  }

  for (let i = 0; i < numPoison; i++) {
    poisons.push(new Poison(random(width), random(height), random(14, 22)));
  }
}

function draw() {
  background(25, 25, 40);

  // UI text
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
  text("Poison Hits: " + poisonHits + " / 10", 10, 35);

  // Game over
  if (gameOver) {
    showGameOver();
    return;
  }

  // Normal gameplay
  for (let f of foods) {
    f.update();
    f.display();
  }

  for (let p of poisons) {
    p.update();
    p.display();
  }

  player.update();
  player.display();

  // Eat food
  for (let f of foods) {
    if (player.collide(f.pos, f.radius)) {
      f.respawn();
      player.grow(2);
      score++;
    }
  }

  // Hit poison
  for (let p of poisons) {
    if (player.collide(p.pos, p.radius)) {
      p.respawn();
      poisonHits++;

      player.grow(-3);
      player.radius = max(15, player.radius);

      if (poisonHits >= 10) {
        gameOver = true;
      }
    }
  }
}

// -------------------- Game Over Screen --------------------

function showGameOver() {
  background(25, 25, 40);

  textAlign(CENTER, CENTER);

  fill(255, 80, 80);
  textSize(48);
  text("GAME OVER", width / 2, height / 2 - 20);

  fill(255);
  textSize(24);
  text("You ate " + score + " foods", width / 2, height / 2 + 20);
  text("Click to restart", width / 2, height / 2 + 60);
}

// -------------------- Mouse Input --------------------

function mousePressed() {
  if (gameOver) {
    restartGame();
    return;
  }
  player.boost();
}

function restartGame() {
  score = 0;
  poisonHits = 0;
  gameOver = false;

  player = new Player(width / 2, height / 2, 30);

  for (let f of foods) {
    f.respawn();
  }
  for (let p of poisons) {
    p.respawn();
  }
}

// ---------------------------------------------------------
// Player Creature
// ---------------------------------------------------------

class Player {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.radius = r;
    this.baseSpeed = 3;
    this.boostSpeed = 7;

    this.boosting = false;
    this.boostFrames = 0;
    this.maxBoostFrames = 20;
  }

  update() {
    let target = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(target, this.pos);
    if (dir.mag() > 1) dir.normalize();
    let speed = this.boosting ? this.boostSpeed : this.baseSpeed;

    this.vel = dir.mult(speed);
    this.pos.add(this.vel);

    this.pos.x = constrain(this.pos.x, this.radius, width - this.radius);
    this.pos.y = constrain(this.pos.y, this.radius, height - this.radius);

    if (this.boosting) {
      this.boostFrames++;
      if (this.boostFrames > this.maxBoostFrames) {
        this.boosting = false;
      }
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    // Body
    noStroke();
    fill(120, 210, 255);
    ellipse(0, 0, this.radius * 2, this.radius * 2);

    // Mouth
    fill(0);
    let mouthSize = this.boosting ? this.radius * 0.8 : this.radius * 0.4;
    ellipse(this.radius * 0.3, 0, mouthSize, mouthSize * 0.6);

    // Eyes
    fill(255);
    ellipse(-this.radius * 0.4, -this.radius * 0.3, this.radius * 0.9);
    ellipse(-this.radius * 0.4,  this.radius * 0.1, this.radius * 0.9);

    // Pupils track movement
    fill(0);
    let px = map(this.vel.x, -this.boostSpeed, this.boostSpeed, -this.radius * 0.15, this.radius * 0.15);
    let py = map(this.vel.y, -this.boostSpeed, this.boostSpeed, -this.radius * 0.15, this.radius * 0.15);

    ellipse(-this.radius * 0.4 + px, -this.radius * 0.3 + py, this.radius * 0.3);
    ellipse(-this.radius * 0.4 + px,  this.radius * 0.1 + py, this.radius * 0.3);

    pop();
  }

  boost() {
    this.boosting = true;
    this.boostFrames = 0;
  }

  collide(p, r) {
    return dist(this.pos.x, this.pos.y, p.x, p.y) < this.radius + r;
  }

  grow(amount) {
    this.radius += amount;
    this.radius = constrain(this.radius, 15, 90);
  }
}

// ---------------------------------------------------------
// Food
// ---------------------------------------------------------

class Food {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.radius = r;
    this.randomVelocity();
  }

  randomVelocity() {
    let a = random(TWO_PI);
    this.vel = createVector(cos(a), sin(a)).mult(random(0.3, 1.2));
  }

  update() {
    this.pos.add(this.vel);
    this.wrap();
  }

  display() {
    fill(255, 200, 100);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  wrap() {
    if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
    if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
    if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
    if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
  }

  respawn() {
    this.pos.set(random(width), random(height));
    this.radius = random(10, 18);
    this.randomVelocity();
  }
}

// ---------------------------------------------------------
// Poison
// ---------------------------------------------------------

class Poison {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.radius = r;
    this.randomVelocity();
  }

  randomVelocity() {
    let a = random(TWO_PI);
    this.vel = createVector(cos(a), sin(a)).mult(random(0.5, 1.5));
  }

  update() {
    this.pos.add(this.vel);
    this.wrap();
  }

  display() {
    fill(255, 120, 120);
    noStroke();
    push();
    translate(this.pos.x, this.pos.y);
    rotate(frameCount * 0.02);
    triangle(-this.radius, this.radius, this.radius, this.radius, 0, -this.radius);
    pop();
  }

  wrap() {
    if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
    if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
    if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
    if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
  }

  respawn() {
    this.pos.set(random(width), random(height));
    this.radius = random(14, 22);
    this.randomVelocity();
  }
}

