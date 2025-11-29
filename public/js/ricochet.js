let orbs = [];
let shocks = [];

function setup() {
  // Mount canvas to the game container
  let container = select('#game-canvas-container') || select('#game-ricochet');
  let canvas = createCanvas(600, 600);
  if (container) {
    canvas.parent(container);
  }

  // Use HSB with alpha range up to 255
  colorMode(HSB, 360, 100, 100, 255);

  // Create colorful orbs
  for (let i = 0; i < 10; i++) {
    let c = color(random(360), 90, 100); // bright, high-saturation color
    orbs.push(
      new Orb(
        createVector(random(width), random(height)),
        p5.Vector.random2D().mult(random(2, 4)),
        random(15, 30),
        c
      )
    );
  }
}

function draw() {
  drawGradientBackground();

  // Update shockwaves
  for (let i = shocks.length - 1; i >= 0; i--) {
    let s = shocks[i];
    s.update();
    s.display();

    for (let o of orbs) {
      s.applyTo(o);
    }

    if (s.finished()) {
      shocks.splice(i, 1);
    }
  }

  // Update and draw orbs
  for (let o of orbs) {
    o.update();
    o.display();
  }
}

function mousePressed() {
  shocks.push(new Shockwave(createVector(mouseX, mouseY)));
}

// ----------------------------------------------------
//   Gradient Background
// ----------------------------------------------------
function drawGradientBackground() {
  // vertical gradient from purple → blue
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(
      color(260, 60, 40),  // top purple
      color(200, 80, 50),  // bottom blue
      t
    );
    stroke(c);
    line(0, y, width, y);
  }
}

// ----------------------------------------------------
//   ORB CLASS
// ----------------------------------------------------
class Orb {
  constructor(p, v, radius, c) {
    this.pos = p.copy();
    this.vel = v.copy();
    this.r = radius;
    this.col = c;
  }

  update() {
    this.pos.add(this.vel);

    // Bounce off walls
    if (this.pos.x < this.r || this.pos.x > width - this.r) {
      this.vel.x *= -1;
      this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    }
    if (this.pos.y < this.r || this.pos.y > height - this.r) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, this.r, height - this.r);
    }
  }

  display() {
    noStroke();
    fill(this.col);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  }
}

// ----------------------------------------------------
//   SHOCKWAVE CLASS
// ----------------------------------------------------
class Shockwave {
  constructor(p) {
    this.pos = p.copy();
    this.radius = 0;
    this.maxR = 200;
    this.growth = 8;
  }

  update() {
    this.radius += this.growth;
  }

  display() {
    noFill();
    // bright white with slight transparency
    stroke(0, 0, 100, 180); 
    strokeWeight(3);
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
  }

  applyTo(o) {
    let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);

    if (d < this.radius && d > 0) {
      let dir = p5.Vector.sub(o.pos, this.pos);
      dir.normalize();
      let force = map(d, 0, this.radius, 4, 0.5);
      dir.mult(force);
      o.vel.add(dir);
    }
  }

  finished() {
    return this.radius > this.maxR;
  }
}
