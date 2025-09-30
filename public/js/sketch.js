// public/js/sketch.js

const FG_PATH = '/images/dumpsterfire.png'; // foreground
const BG_PATH = '/images/alley.jpg';        // optional background

let img, bg;
let x = 0;
let noiseOffset = 0;
let cnv;

function preload() {
  img = loadImage(FG_PATH,
    () => console.log('Loaded:', FG_PATH),
    (e) => console.warn('Failed to load', FG_PATH, e)
  );
  // Optional BG:
  bg = loadImage(BG_PATH,
    () => console.log('Loaded:', BG_PATH),
    (e) => console.warn('Failed to load', BG_PATH, e)
  );
}

function setup() {
  const parent = document.getElementById('splash-canvas');
  const w = (parent && parent.clientWidth) ? parent.clientWidth : 800;
  const h = Math.max(Math.round(w * 0.6), 320); // keep decent height

  cnv = createCanvas(w, h);
  if (parent) cnv.parent('splash-canvas');
  imageMode(CORNER);
}

function windowResized() {
  const parent = document.getElementById('splash-canvas');
  if (!parent) return;
  const w = parent.clientWidth || 800;
  const h = Math.max(Math.round(w * 0.6), 320);
  resizeCanvas(w, h);
}

function draw() {
  // Always draw a visible background so it never looks "blank"
  background(20);
  noStroke();
  fill(50);
  rect(0, 0, width, height);

  if (bg) image(bg, 0, 0, width, height);

  if (img) {
    // flicker via Perlin noise
    const flicker = noise(noiseOffset) * 100;
    noiseOffset += 0.1;
    tint(255, 255 - flicker);

    const offsetX = random(-2, 2);
    const offsetY = random(-2, 2);

    image(img, x + offsetX, height / 2 + offsetY);

    noTint();

    x += 2;
    if (x > width) x = -img.width;
  } else {
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('Loading splash…', width / 2, height / 2);
  }
}
