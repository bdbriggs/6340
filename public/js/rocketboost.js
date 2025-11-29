// Simple Rocket Ship for a Sweet Little Astronaut 💫

let numStars = 80;
let starX = new Array(numStars);
let starY = new Array(numStars);
let starSpeed = new Array(numStars);

let rocketY;
let rocketSpeed = 3;

function setup() {
  // Mount canvas to the game container
  let container = select('#game-canvas-container') || select('#game-rocket');
  let canvas = createCanvas(500, 700);
  if (container) {
    canvas.parent(container);
  }

  // Start the rocket below the screen
  rocketY = height + 150;

  // Create starfield
  for (let i = 0; i < numStars; i++) {
    starX[i] = random(width);
    starY[i] = random(height);
    starSpeed[i] = random(0.5, 2);
  }
}

function draw() {
  // Space background
  background(5, 10, 35);

  drawStars();

  // Move the rocket up
  rocketY -= rocketSpeed;

  // When rocket goes off the top, bring it back to bottom
  if (rocketY < -200) {
    rocketY = height + 150;
  }

  // Draw the rocket in the middle of the screen
  drawRocket(width / 2, rocketY);

  // Little message
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text("Click for SUPER BOOST!", width / 2, 40);
}

function drawStars() {
  noStroke();
  for (let i = 0; i < numStars; i++) {
    fill(255);
    ellipse(starX[i], starY[i], 3, 3);

    // Move stars downward slowly so it feels like we're flying up
    starY[i] += starSpeed[i];
    if (starY[i] > height) {
      starY[i] = 0;
      starX[i] = random(width);
    }
  }
}

function drawRocket(x, y) {
  push();
  translate(x, y);

  // Body
  noStroke();
  fill(200);
  rectMode(CENTER);
  rect(0, 0, 50, 140, 20);

  // Nose cone
  fill(230, 60, 80);
  triangle(-25, -70, 25, -70, 0, -120);

  // Fins
  fill(230, 60, 80);
  triangle(-25, 40, -55, 70, -25, 70);
  triangle(25, 40, 55, 70, 25, 70);

  // Window
  fill(100, 180, 255);
  ellipse(0, -20, 35, 35);
  fill(220);
  ellipse(0, -20, 18, 18);

  // Flame (flickering)
  let flameLength = random(40, 70);
  fill(255, 160, 0);
  triangle(-15, 70, 15, 70, 0, 70 + flameLength);
  fill(255, 230, 150);
  triangle(-8, 70, 8, 70, 0, 70 + flameLength * 0.6);

  pop();
}

// Mouse click gives the rocket a temporary speed boost
function mousePressed() {
  rocketSpeed = 8;
}

function mouseReleased() {
  rocketSpeed = 3;
}
