// Simple "Dumpster Fire Catch" game
// Uses trashbag.png and dumpsterfire.png in the same folder as this sketch

let trashImg;
let dumpsterImg;

let trashX, trashY;
let trashVy = 4; // fall speed
let sparks = [];

let dumpsterX, dumpsterY;

let score = 0;
let misses = 0;

let trashState = "falling"; // "falling", "caught", or "missed"
let trashEffectFrames = 0;
const TRASH_EFFECT_DURATION = 20; // how many frames the vanish animation lasts

// Scale factors for images (tweak if images are huge/small)
let trashScale = 0.25;
let dumpsterScale = 1.5;

function preload() {
  trashImg = loadImage("/images/trashbag.png", 
    () => {
      console.log("Trash bag image loaded successfully");
      console.log("Image dimensions:", trashImg.width, "x", trashImg.height);
    },
    () => {
      console.error("Failed to load trashbag.png - using fallback");
      trashImg = null;
    }
  );
  dumpsterImg = loadImage("/images/dumpsterfire.png",
    () => {
      console.log("Dumpster image loaded successfully");
      console.log("Image dimensions:", dumpsterImg.width, "x", dumpsterImg.height);
    },
    () => {
      console.error("Failed to load dumpsterfire.png");
      dumpsterImg = null;
    }
  );
}

function setup() {
  // Mount canvas to the game container
  let container = select('#game-canvas-container') || select('#game-future');
  let canvas = createCanvas(800, 600);
  if (container) {
    canvas.parent(container);
  }

  // Place dumpster near bottom
  dumpsterY = height - 120;

  // Initialize trash position even if image isn't loaded
  resetTrash();
}

function draw() {
drawGradientBackground(color(10, 5, 20), color(255, 110, 0));  
// purple twilight → orange heat glow
// top color                bottom color


  // --- HUD ---
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  text("Score: " + score, 10, 10);
  text("Misses: " + misses, 10, 35);
  text("Move mouse left/right to catch the trash", 10, 60);

  // --- Update dumpster position (follow mouse) ---
  dumpsterX = constrain(mouseX, 0, width);

  // --- Draw dumpster ---
  let dumpW, dumpH;
  if (dumpsterImg && dumpsterImg.width > 0) {
    dumpW = dumpsterImg.width * dumpsterScale;
    dumpH = dumpsterImg.height * dumpsterScale;
    imageMode(CENTER);
    image(dumpsterImg, dumpsterX, dumpsterY, dumpW, dumpH);
  } else {
    // Fallback: draw a simple rectangle for dumpster
    dumpW = 150;
    dumpH = 100;
    fill(100);
    rectMode(CENTER);
    rect(dumpsterX, dumpsterY, dumpW, dumpH);
  }

// 🔥 Ambient sparks along the entire top of the dumpster
if (dumpsterImg && dumpsterImg.height > 0) {
  let dumpW = dumpsterImg.width * dumpsterScale;
  let dumpH = dumpsterImg.height * dumpsterScale;
  let topY = dumpsterY - dumpH / 2;
  if (frameCount % 2 === 0) {          // more often (every 2 frames)
    for (let i = 0; i < 3; i++) {      // 6 spawn points across the top
      let x = random(dumpsterX - dumpW / 2, dumpsterX + dumpW / 2);
      emitSparks(x, topY, 2);          // 2 sparks at each point
    }
  }
} else {
  // Fallback sparks
  let topY = dumpsterY - 50;
  if (frameCount % 2 === 0) {
    for (let i = 0; i < 3; i++) {
      let x = random(dumpsterX - 75, dumpsterX + 75);
      emitSparks(x, topY, 2);
    }
  }
}

  // 🔥 Update + draw sparks
  updateSparks();

  // --- Trash behavior depends on state ---
  let trashW, trashH;
  if (trashImg && trashImg.width && trashImg.width > 0) {
    trashW = trashImg.width * trashScale;
    trashH = trashImg.height * trashScale;
  } else {
    trashW = 40;
    trashH = 40;
  }

  if (trashState === "falling") {
    // Normal falling behavior
    trashY += trashVy;

    // Draw trash normally
    if (trashImg && trashImg.width && trashImg.width > 0) {
      imageMode(CENTER);
      image(trashImg, trashX, trashY, trashW, trashH);
    } else {
      // Fallback: draw a simple rectangle for trash
      fill(200, 200, 0);
      rectMode(CENTER);
      rect(trashX, trashY, trashW, trashH);
    }

    // Check collision with dumpster
    if (isColliding(
      trashX, trashY, trashW, trashH,
      dumpsterX, dumpsterY, dumpW, dumpH
    )) {
      score++;
      startTrashEffect("caught");
    }

    // Check if trash fell off screen
    if (trashY - trashH / 2 > height) {
      misses++;
      startTrashEffect("missed");
    }

  } else {
    // We're in a vanish animation (caught or missed)
    trashEffectFrames--;

    // 0 → 1 progress
    let t = 1 - (trashEffectFrames / TRASH_EFFECT_DURATION);
    t = constrain(t, 0, 1);

    // Shrink + fade
    let scale = lerp(1, 0, t);
    let alpha = lerp(255, 0, t);

    if (trashImg && trashImg.width && trashImg.width > 0) {
      push();
      imageMode(CENTER);
      tint(255, alpha);
      image(
        trashImg,
        trashX,
        trashY,
        trashW * scale,
        trashH * scale
      );
      pop();
      noTint();
    } else {
      // Fallback: draw shrinking rectangle
      push();
      fill(200, 200, 0, alpha);
      rectMode(CENTER);
      rect(trashX, trashY, trashW * scale, trashH * scale);
      pop();
    }

    if (trashEffectFrames <= 0) {
      resetTrash();
    }
  }
}
function drawGradientBackground(c1, c2) {
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let r = lerp(red(c1),   red(c2),   t);
    let g = lerp(green(c1), green(c2), t);
    let b = lerp(blue(c1),  blue(c2),  t);
    stroke(r, g, b);
    line(0, y, width, y);
  }
}


function startTrashEffect(type) {
  trashState = type; // "caught" or "missed"
  trashEffectFrames = TRASH_EFFECT_DURATION;

  // 💥 Big burst of sparks when it's a catch
  if (type === "caught") {
    let dumpH = (dumpsterImg && dumpsterImg.height > 0) ? dumpsterImg.height * dumpsterScale : 100;
    emitSparks(dumpsterX, dumpsterY - dumpH / 2, 200);
  }
}

// Reset trash to a new random position at the top
function resetTrash() {
  trashX = random(80, width - 80);
  trashY = -50;
  trashVy = random(2, 8); // 🔥 now each bag falls at a different speed!
  trashState = "falling";
}


// ----------------- Sparks -----------------

class Spark {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(
      random(-1, 1),        // small sideways drift
      random(-3, -1)        // mostly upward
    );
    this.size = random(4, 8);
    this.life = 30;          // frames left
    this.maxLife = this.life;
    this.hue = random(25, 50);  // warm yellow/orange
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95);       // slight drag
    this.life--;
  }

  display() {
    let alpha = map(this.life, 0, this.maxLife, 0, 255);
    noStroke();
    fill(255, random(180, 230), 80, alpha);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}

function emitSparks(x, y, count) {
  for (let i = 0; i < count; i++) {
    sparks.push(new Spark(x, y));
  }
}

function updateSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].display();
    if (sparks[i].isDead()) {
      sparks.splice(i, 1);
    }
  }
}

// Simple AABB collision using center positions + widths/heights
function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  let left1 = x1 - w1 / 2;
  let right1 = x1 + w1 / 2;
  let top1 = y1 - h1 / 2;
  let bottom1 = y1 + h1 / 2;

  let left2 = x2 - w2 / 2;
  let right2 = x2 + w2 / 2;
  let top2 = y2 - h2 / 2;
  let bottom2 = y2 + h2 / 2;

  return !(
    right1 < left2 ||
    left1 > right2 ||
    bottom1 < top2 ||
    top1 > bottom2
  );
}
